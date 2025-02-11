/**
 * This file contains all the types related to the event entity.
 *
 */
import { Event } from "../models/event/Event";

/**
 * Request to create an event.
 *
 * @property name - The name of the event.
 * @property description - The description of the event.
 * @property date - The date of the event.
 * @property location - The location of the event.
 * @property ticketLimit - The ticket limit of the event.
 * @property price - The price of the event.
 */
export type CreateEventRequest = {
    name: string;
    description: string;
    date: Date;
    location: string;
    ticketLimit: number;
    price: number;
};

/**
 * Response when an event is created.
 *
 * @property message - A message indicating the event was created.
 * @property event - The event that was created.
 */
export type EventCreatedResponse = {
    message: string;
    event: Event;
};

/**
 * Request to get the status of an event.
 *
 * @property eventId - The ID of the event.
 */
export type EventStatusRequest = {
    eventId: number;
};

/**
 * Response when the status of an event is retrieved.
 *
 * @property event - The event whose status was retrieved.
 * @property ticketsAvailable - The number of tickets available for the event.
 * @property waitingListCount - The number of users on the waiting list for the event.
 */
export type EventStatusResponse = {
    event: Event;
    ticketsAvailable: number;
    waitingListCount: number;
};
