import Joi from 'joi';
import {CreateEvent} from "./event-types";

const createEventSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    location: Joi.string().required(),
    ticketLimit: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
});

export function validateCreateEventRequest(event: any): CreateEvent {
    const { error, value } = createEventSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}