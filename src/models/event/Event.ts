import {BookingStatus, PrismaClient} from "@prisma/client";
import {EventNotFoundError} from "../../errors/EventNotFoundError";
import {Booking} from "../booking/Booking";
import {CreateEventRequest} from "../../types/event";

const prisma = new PrismaClient();

export class Event {
    private readonly id: string;
    private readonly name: string;
    private readonly description: string;
    private readonly date: Date;
    private readonly location: string;
    private readonly ticketLimit: number;
    private readonly price: number;
    
    private constructor(id: string, name: string, description: string, date: Date, location: string,
                        ticketLimit: number, price: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.location = location;
        this.ticketLimit = ticketLimit;
        this.price = price;
    }
    
    public getId(): string {
        return this.id;
    }
    
    public async isSoldOut(): Promise<boolean> {
        const ticketsSold = await prisma.booking.count({
            where: {
                eventId: this.id,
                status: BookingStatus.CONFIRMED,
                deletedAt: null
            }
        })
        return ticketsSold >= this.ticketLimit;
    }
    
    public async bumpWaitList(): Promise<void> {
        if (await this.isSoldOut()) return;
        
        const firstWaiting = await Booking.getFirstOnWaitList(this);
        if (!firstWaiting) return;
        
        await firstWaiting.upgrade();
        
        // Recursively call bumpWaitList() until the event is sold out or the wait list is empty
        await this.bumpWaitList();
    }
    
    public async getTicketsAvailableCount(): Promise<number> {
        const ticketsSold = await prisma.booking.count({
            where: {
                eventId: this.id,
                status: BookingStatus.CONFIRMED,
                deletedAt: null
            }
        });
        return this.ticketLimit - ticketsSold;
    }
    
    public async getWaitingListCount(): Promise<number> {
        return prisma.booking.count({
            where: {
                eventId: this.id,
                status: BookingStatus.PENDING,
                deletedAt: null
            }
        });
    }
    
    public static async create(event: CreateEventRequest): Promise<Event> {
        event.date = new Date(event.date);
        const newEvent = await prisma.event.create({
            data: event
        });
        
        return new Event(newEvent.id, newEvent.name, newEvent.description, newEvent.date, newEvent.location,
            newEvent.ticketLimit, newEvent.price);
    }
    
    public static async getById(id: string): Promise<Event> {
        const event = await prisma.event.findUnique({
            where: {
                id
            }
        });
        
        if (!event) {
            throw new EventNotFoundError(id);
        }
        return new Event(event.id, event.name, event.description, event.date, event.location, event.ticketLimit,
            event.price);
    }
}