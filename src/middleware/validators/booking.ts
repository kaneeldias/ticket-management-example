import Joi from "joi";
import { CancelBookingRequest, CreateBookingRequest } from "../../types/booking";

const createBookingSchema = Joi.object({
    eventId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
});

const cancelBookingSchema = Joi.object({
    id: Joi.number().integer().required(),
});

/**
 * Validates a booking request.
 * Throws an error if the request is invalid.
 * Otherwise, returns the validated request.
 *
 * @param booking The object to validate
 * @returns {CreateBookingRequest} The validated request
 */
export function validateBookingRequest(booking: any): CreateBookingRequest {
    const { error, value } = createBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}

/**
 * Validates a cancel booking request.
 * Throws an error if the request is invalid.
 * Otherwise, returns the validated request.
 *
 * @param booking The object to validate
 * @returns {CancelBookingRequest} The validated request
 */
export function validateCancelBookingRequest(booking: any): CancelBookingRequest {
    const { error, value } = cancelBookingSchema.validate(booking);
    if (error) {
        throw error;
    }
    return value;
}
