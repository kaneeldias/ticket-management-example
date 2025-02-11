import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "../user/User";
import { Event } from "../event/Event";
import { BookingNotFoundError } from "../../errors/BookingNotFoundError";
import { EventSoldOutError } from "../../errors/EventSoldOutError";
import { BookingAlreadyCancelledError } from "../../errors/BookingAlreadyCancelledError";
import { BookingAlreadyConfirmedError } from "../../errors/BookingAlreadyConfirmedError";

const prisma = new PrismaClient();

// Represents the possible statuses of a booking
type BookingStatusType = "PENDING" | "CONFIRMED" | "CANCELLED";

/**
 * Represents a booking for an event
 *
 * @class Booking
 * @public
 */
export class Booking {
    private readonly id: number;
    private readonly eventId: number;
    private readonly userId: number;
    private status: BookingStatusType;

    private constructor(id: number, eventId: number, userId: number, status: BookingStatusType) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.status = status;
    }

    /**
     * Retrieves a booking by its ID
     *
     * @param id - The ID of the booking to retrieve
     * @returns The booking with the specified ID if it exists
     * @throws {BookingNotFoundError} Thrown if no booking with the specified ID exists
     */
    public static async getById(id: number): Promise<Booking> {
        const booking = await prisma.booking.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!booking) {
            throw new BookingNotFoundError(id);
        }
        return new Booking(booking.id, booking.eventId, booking.userId, booking.status);
    }

    /**
     * Creates a ticket for an event
     *
     * @param event - The event to create a ticket for
     * @param user - The user to create a ticket for
     * @returns The created ticket
     * @throws {EventSoldOutError} Thrown if the event is sold out
     */
    public static async createTicket(event: Event, user: User): Promise<Booking> {
        if (await event.isSoldOut()) {
            throw new EventSoldOutError(event.getId());
        }

        const ticket = await prisma.booking.create({
            data: {
                eventId: event.getId(),
                userId: user.getId(),
                status: "CONFIRMED",
            },
        });
        return new Booking(ticket.id, ticket.eventId, ticket.userId, ticket.status);
    }

    /**
     * Adds a user to the wait list for an event
     *
     * @param event - The event to add the user to the wait list for
     * @param user - The user to add to the wait list
     * @returns The created booking
     */
    public static async addToWaitlist(event: Event, user: User): Promise<Booking> {
        const waiting = await prisma.booking.create({
            data: {
                eventId: event.getId(),
                userId: user.getId(),
                status: "PENDING",
            },
        });
        return new Booking(waiting.id, waiting.eventId, waiting.userId, waiting.status);
    }

    /**
     * Retrieves the first user on the wait list for an event
     *
     * @param event - The event to retrieve the first user on the wait list for
     * @returns The first user on the wait list or null if no users are on the wait list
     */
    public static async getFirstOnWaitList(event: Event): Promise<Booking | null> {
        const firstWaiting = await prisma.booking.findFirst({
            where: {
                eventId: event.getId(),
                status: "PENDING",
                deletedAt: null,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (!firstWaiting) return null;
        return new Booking(firstWaiting.id, firstWaiting.eventId, firstWaiting.userId, firstWaiting.status);
    }

    /**
     * Retrieves the booking's ID
     *
     * @returns The booking's ID
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Retrieves the event associated with the booking
     *
     * @returns The event associated with the booking
     * @throws {EventNotFoundError} Thrown if the event associated with the booking does not exist
     */
    public async getEvent(): Promise<Event> {
        return Event.getById(this.eventId);
    }

    /**
     * Cancels the booking
     *
     * @returns The updated booking
     * @throws {BookingAlreadyCancelledError} Thrown if the booking has already been cancelled
     * @throws {BookingNotFoundError} Thrown if the booking does not exist
     */
    public async cancel(): Promise<Booking> {
        if (this.status === "CANCELLED") {
            throw new BookingAlreadyCancelledError(this.id);
        }

        try {
            const updatedBooking = await prisma.booking.update({
                where: {
                    id: this.id,
                    deletedAt: null,
                },
                data: {
                    status: "CANCELLED",
                },
            });
            this.status = updatedBooking.status;
            return this;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                throw new BookingNotFoundError(this.id);
            }
            throw error;
        }
    }

    /**
     * Upgrades the booking to a confirmed status
     *
     * @returns The updated booking
     * @throws {BookingAlreadyConfirmedError} Thrown if the booking has already been confirmed
     * @throws {BookingAlreadyCancelledError} Thrown if the booking has already been cancelled
     * @throws {BookingNotFoundError} Thrown if the booking does not exist
     */
    public async upgrade(): Promise<Booking> {
        if (this.status === "CONFIRMED") {
            throw new BookingAlreadyConfirmedError(this.id);
        }

        if (this.status === "CANCELLED") {
            throw new BookingAlreadyCancelledError(this.id);
        }

        try {
            const updatedTicket = await prisma.booking.update({
                where: {
                    id: this.id,
                },
                data: {
                    status: "CONFIRMED",
                },
            });
            this.status = updatedTicket.status;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                throw new BookingNotFoundError(this.id);
            }
            throw error;
        }

        return this;
    }
}
