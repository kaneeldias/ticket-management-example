import Joi from 'joi';
import {CreateBooking, CreateEvent} from "./event-types";

const createEventSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    location: Joi.string().required(),
    ticketLimit: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
});

const createBookingSchema = Joi.object({
    eventId: Joi.string().required(),
    userId: Joi.string().required()
});

const cancelBookingSchema = Joi.object({
    id: Joi.string().required(),
});

export function validateCreateEventRequest(event: any): CreateEvent {
    const { error, value } = createEventSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}

export function validateBookingRequest(booking: any): CreateBooking {
    const { error, value } = createBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}

export function validateCancelBookingRequest(booking: any): { id: string } {
    const { error, value } = cancelBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}