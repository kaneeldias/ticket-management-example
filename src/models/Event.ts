import { CreateEventRequest } from "../types/event";
import { validateCreateEventRequest } from "../middleware/validators/event";
import { prisma } from "../utils/db";
import { EventNotFoundError } from "../errors/EventNotFoundError";

/**
 * Represents an event
 */
export class Event {
    private readonly id: number;
    private readonly name: string;
    private readonly description: string;
    private readonly date: Date;
    private readonly location: string;
    private readonly ticketLimit: number;
    private readonly price: number;

    private constructor(
        id: number,
        name: string,
        description: string,
        date: Date,
        location: string,
        ticketLimit: number,
        price: number,
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.date = date;
        this.location = location;
        this.ticketLimit = ticketLimit;
        this.price = price;
    }

    /**
     * Creates a new event
     *
     * @param event - The details of the event to create
     * @returns The newly created event
     * @throws {Joi.ValidationError} Thrown if the event details are invalid
     */
    public static async create(event: CreateEventRequest): Promise<Event> {
        event = validateCreateEventRequest(event);
        event.date = new Date(event.date);
        const newEvent = await prisma.event.create({
            data: event,
        });

        return new Event(
            newEvent.id,
            newEvent.name,
            newEvent.description,
            newEvent.date,
            newEvent.location,
            newEvent.ticketLimit,
            newEvent.price,
        );
    }

    /**
     * Retrieves an event by its ID
     *
     * @param id - The ID of the event to retrieve
     * @returns The event with the specified ID if it exists
     */
    public static async getById(id: number): Promise<Event> {
        const event = await prisma.event.findUnique({
            where: {
                id,
            },
        });

        if (!event) {
            throw new EventNotFoundError(id);
        }
        return new Event(
            event.id,
            event.name,
            event.description,
            event.date,
            event.location,
            event.ticketLimit,
            event.price,
        );
    }

    /**
     * Retrieves the ID of the event
     *
     * @returns The ID of the event
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Determines whether the event is sold out or not
     *
     * @returns True if the event is sold out, false otherwise
     */
    public async isSoldOut(): Promise<boolean> {
        const ticketsSold = await prisma.booking.count({
            where: {
                eventId: this.id,
                status: "CONFIRMED",
                deletedAt: null,
            },
        });
        return ticketsSold >= this.ticketLimit;
    }

    /**
     * Retrieves the number of tickets available for the event
     *
     * @returns The number of tickets available for the event
     */
    public async getTicketsAvailableCount(): Promise<number> {
        const ticketsSold = await prisma.booking.count({
            where: {
                eventId: this.id,
                status: "CONFIRMED",
                deletedAt: null,
            },
        });
        return this.ticketLimit - ticketsSold;
    }

    /**
     * Retrieves the number of users on the wait list for the event
     *
     * @returns The number of users on the wait list for the event
     */
    public async getWaitingListCount(): Promise<number> {
        return prisma.booking.count({
            where: {
                eventId: this.id,
                status: "PENDING",
                deletedAt: null,
            },
        });
    }
}
