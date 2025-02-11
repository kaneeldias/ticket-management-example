import Joi from "joi";
import {CreateEventRequest, EventStatusRequest} from "../../types/event";

const createEventSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    location: Joi.string().required(),
    ticketLimit: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
});

const eventStatusSchema = Joi.object({
    eventId: Joi.string().required()
});

export function validateCreateEventRequest(event: any): CreateEventRequest {
    const { error, value } = createEventSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}

export function validateEventStatusRequest(event: any): EventStatusRequest {
    const { error, value } = eventStatusSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}
