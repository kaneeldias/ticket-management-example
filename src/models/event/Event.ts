import {CreateEvent, EventType} from "./event-types";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export class Event {
    private event: EventType;
    
    private constructor(event: EventType) {
        this.event = event;
    }
    
    public static async create(event: CreateEvent): Promise<Event> {
        event.date = new Date(event.date);
        const newEvent = await prisma.event.create({
            data: event
        });
        return new Event(newEvent);
    }
}