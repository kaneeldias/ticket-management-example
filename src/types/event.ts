import {Event} from "../models/event/Event";

export type CreateEventRequest = {
    name: string;
    description: string;
    date: Date;
    location: string;
    ticketLimit: number;
    price: number;
}

export type EventCreatedResponse = {
    message: string;
    event: Event;
}

export type EventStatusRequest = {
    eventId: string;
}

export type EventStatusResponse = {
    event: Event;
    ticketsAvailable: number;
    waitingListCount: number;
}

