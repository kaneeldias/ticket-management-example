import Joi from "joi";
import { CreateEventRequest, EventStatusRequest } from "../../types/event";

const createEventSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    location: Joi.string().required(),
    ticketLimit: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required(),
});

const eventStatusSchema = Joi.object({
    eventId: Joi.number().integer().required(),
});

/**
 * Validates a create event request.
 * Throws an error if the request is invalid.
 * Otherwise, returns the validated request.
 *
 * @param event The object to validate
 * @returns {CreateEventRequest} The validated request
 */
export function validateCreateEventRequest(event: any): CreateEventRequest {
    const { error, value } = createEventSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}

/**
 * Validates an event status request.
 * Throws an error if the request is invalid.
 * Otherwise, returns the validated request.
 *
 * @param event The object to validate
 * @returns {EventStatusRequest} The validated request
 */
export function validateEventStatusRequest(event: any): EventStatusRequest {
    const { error, value } = eventStatusSchema.validate(event);
    if (error) {
        throw error;
    }
    return value;
}
