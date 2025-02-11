import Joi from 'joi';
import {CancelBookingRequest, CreateBookingRequest} from "../../types/booking";

const createBookingSchema = Joi.object({
    eventId: Joi.string().required(),
    userId: Joi.string().required()
});

const cancelBookingSchema = Joi.object({
    id: Joi.string().required(),
});

export function validateBookingRequest(booking: any): CreateBookingRequest {
    const { error, value } = createBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}

export function validateCancelBookingRequest(booking: any): CancelBookingRequest {
    const { error, value } = cancelBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}