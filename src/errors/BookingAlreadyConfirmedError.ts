/**
 * Error thrown when an attempt is made to upgrade a booking that has already been confirmed.
 *
 * @class BookingAlreadyConfirmedError
 * @extends {Error}
 */
export class BookingAlreadyConfirmedError extends Error {
    /**
     * Creates an instance of BookingAlreadyConfirmedError.
     *
     * @param {number} id The ID of the booking on which the operation was attempted
     */
    constructor(id: number) {
        super(`Booking with ID ${id} has already been confirmed`);
        this.name = "BookingConfirmedError";
    }
}
