import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { Mutex } from "async-mutex";
import { User } from "../models/User";
import EventEmitter from "node:events";
import { UserAlreadyHasBookingError } from "../errors/UserAlreadyHasBookingError";
import { UserAlreadyOnWaitListError } from "../errors/UserAlreadyOnWaitListError";

/**
 * A class that manages bookings for events ensuring thread safety and concurrency
 */
class BookingManager {
    private eventMutexes = new Map<number, Mutex>();
    private bookingMutexes = new Map<number, Mutex>();
    private waitlistHandler = new EventEmitter();

    constructor() {
        this.waitlistHandler.on("trigger-waitlist-bump", async (event) => {
            await this.bumpWaitlist(event.eventId);
        });
    }

    /**
     * Creates a booking for a user for an event.
     * While a booking is being created, the event is locked to prevent unexpected behavior
     *
     * @param userId - The ID of the user
     * @param eventId - The ID of the event
     * @returns The created booking
     */
    public async createBooking(userId: number, eventId: number): Promise<Booking> {
        await this.acquireEventMutex(eventId);
        try {
            const user = await User.getById(userId);
            const event = await Event.getById(eventId);

            if (await user.hasTicket(event)) {
                throw new UserAlreadyHasBookingError(userId, eventId);
            }

            if (await user.isOnWaitList(event)) {
                throw new UserAlreadyOnWaitListError(userId, eventId);
            }

            if (await event.isSoldOut()) {
                return await Booking.addToWaitlist(event, user);
            }

            return await Booking.createTicket(event, user);
        } finally {
            await this.releaseEventMutex(eventId);
        }
    }

    /**
     * Cancels a booking for an event.
     * While a booking is being cancelled, the booking is locked to prevent unexpected behavior,
     * and the event is locked to ensure that the waitlist is updated correctly
     *
     * @param bookingId - The ID of the booking to cancel
     * @returns The cancelled booking
     */
    public async cancelBooking(bookingId: number): Promise<Booking> {
        await this.acquireBookingMutex(bookingId);

        const booking = await Booking.getById(bookingId);
        const event = await booking.getEvent();

        await this.acquireEventMutex(event.getId());
        try {
            const cancelledBooking = await booking.cancel();

            const associatedEvent = await booking.getEvent();
            this.waitlistHandler.emit("trigger-waitlist-bump", {
                eventId: associatedEvent.getId(),
            });

            return cancelledBooking;
        } finally {
            await this.releaseEventMutex(event.getId());
            await this.releaseBookingMutex(bookingId);
        }
    }

    /**
     * Bumps the first user on the waitlist for an event to a confirmed booking. During this process,
     * the event as well as the booking is locked to prevent unexpected behavior
     *
     * @param eventId - The ID of the event
     */
    private async bumpWaitlist(eventId: number): Promise<void> {
        await this.acquireEventMutex(eventId);
        try {
            const event = await Event.getById(eventId);
            if (await event.isSoldOut()) return;

            const firstOnWaitlist = await Booking.getFirstOnWaitList(event);
            if (firstOnWaitlist) {
                await this.acquireBookingMutex(firstOnWaitlist.getId());
                await firstOnWaitlist.upgrade();
                await this.releaseBookingMutex(firstOnWaitlist.getId());
            }
        } finally {
            await this.releaseEventMutex(eventId);
        }
    }

    private getEventMutex(eventId: number): Mutex {
        if (this.eventMutexes.has(eventId)) {
            return this.eventMutexes.get(eventId)!;
        }
        const mutex = new Mutex();
        this.eventMutexes.set(eventId, mutex);
        return mutex;
    }

    private async acquireEventMutex(eventId: number): Promise<void> {
        const mutex = this.getEventMutex(eventId);
        await mutex.acquire();
    }

    private async releaseEventMutex(eventId: number): Promise<void> {
        const mutex = this.getEventMutex(eventId);
        mutex.release();
    }

    private getBookingMutex(bookingId: number): Mutex {
        if (this.bookingMutexes.has(bookingId)) {
            return this.bookingMutexes.get(bookingId)!;
        }
        const mutex = new Mutex();
        this.bookingMutexes.set(bookingId, mutex);
        return mutex;
    }

    private async acquireBookingMutex(bookingId: number): Promise<void> {
        const mutex = this.getBookingMutex(bookingId);
        await mutex.acquire();
    }

    private async releaseBookingMutex(bookingId: number): Promise<void> {
        const mutex = this.getBookingMutex(bookingId);
        mutex.release();
    }
}

const bookingManager = new BookingManager();
export default bookingManager;
