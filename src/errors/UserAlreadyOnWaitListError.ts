/**
 * Error thrown when a user is already on the waitlist for an event
 *
 * @class UserAlreadyOnWaitListError
 * @extends {Error}
 */
export class UserAlreadyOnWaitListError extends Error {
    /**
     * Creates an instance of UserAlreadyOnWaitListError.
     *
     * @param {number} userId The ID of the user
     * @param {number} eventId The ID of the event
     */
    constructor(userId: number, eventId: number) {
        super(`User with ID ${userId} already is already on the waitlist for event ${eventId}`);
    }
}
