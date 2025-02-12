/**
 * Error thrown when a user already has a booking for an event
 *
 * @class UserAlreadyHasBookingError
 * @extends {Error}
 */
export class UserAlreadyHasBookingError extends Error {
    /**
     * Creates an instance of UserAlreadyHasBookingError.
     *
     * @param {number} userId The ID of the user
     * @param {number} eventId The ID of the event
     */
    constructor(userId: number, eventId: number) {
        super(`User with ID ${userId} already has a booking for event ${eventId}`);
    }
}
