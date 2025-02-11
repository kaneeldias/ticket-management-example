import {BookingStatus, PrismaClient} from "@prisma/client";
import {User} from "../user/User";
import {Event} from "../event/Event";
import {BookingNotFoundError} from "../../errors/BookingNotFoundError";
import {EventSoldOutError} from "../../errors/EventSoldOutError";
import {BookingAlreadyCancelledError} from "../../errors/BookingAlreadyCancelledError";

const prisma = new PrismaClient();

type BookingStatusType = "PENDING" | "CONFIRMED" | "CANCELLED"

export class Booking {
    
    private readonly id: string;
    private readonly eventId: string;
    private readonly userId: string;
    private status: BookingStatusType;
    
    private constructor(id: string, eventId: string, userId: string, status: BookingStatusType) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.status = status;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public async getEvent(): Promise<Event> {
        return Event.getById(this.eventId);
    }
    
    public async cancel(): Promise<Booking> {
        const booking = await prisma.booking.findUnique({
            where: {
                id: this.id,
                deletedAt: null
            }
        });
        
        if (!booking) {
            throw new BookingNotFoundError(this.id);
        }
        
        if (booking.status === BookingStatus.CANCELLED) {
            throw new BookingAlreadyCancelledError(this.id);
        }
        
        const updatedBooking = await prisma.booking.update({
            where: {
                id: this.id,
                deletedAt: null
            },
            data: {
                status: BookingStatus.CANCELLED
            }
        });
        
        if (!updatedBooking) {
            throw new BookingNotFoundError(this.id);
        }
        
        this.status = updatedBooking.status;
        return this;
    }
    
    public async upgrade(): Promise<Booking> {
        const updatedTicket = await prisma.booking.update({
            where: {
                id: this.id
            },
            data: {
                status: BookingStatus.CONFIRMED
            }
        });
        if (!updatedTicket) {
            throw new BookingNotFoundError(this.id);
        }
        
        this.status = updatedTicket.status;
        return this;
    }
    
    public static async getFirstOnWaitList(event: Event): Promise<Booking | null> {
        const firstWaiting = await prisma.booking.findFirst({
            where: {
                eventId: event.getId(),
                status: BookingStatus.PENDING,
                deletedAt: null
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        
        if (!firstWaiting) return null
        return new Booking(firstWaiting.id, firstWaiting.eventId, firstWaiting.userId, firstWaiting.status);
    }
    
    public static async getById(id: string): Promise<Booking> {
        const booking = await prisma.booking.findUnique({
            where: {
                id,
                deletedAt: null
            }
        });
        if (!booking) {
            throw new BookingNotFoundError(id);
        }
        return new Booking(booking.id, booking.eventId, booking.userId, booking.status);
    }
    
    public static async createTicket(event: Event, user: User): Promise<Booking> {
        if (await event.isSoldOut()) {
            throw new EventSoldOutError(event.getId());
        }
        
        const ticket = await prisma.booking.create({
            data: {
                eventId: event.getId(),
                userId: user.getId(),
                status: BookingStatus.CONFIRMED
            }
        });
        return new Booking(ticket.id, ticket.eventId, ticket.userId, ticket.status);
    }
    
    public static async addToWaitlist(event: Event, user: User): Promise<Booking> {
        const waiting = await prisma.booking.create({
            data: {
                eventId: event.getId(),
                userId: user.getId(),
                status: BookingStatus.PENDING
            }
        });
        return new Booking(waiting.id, waiting.eventId, waiting.userId, waiting.status);
    }
}