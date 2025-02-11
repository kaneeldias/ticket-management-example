/**
 * Error thrown when an attempt is made to modify a booking that has already been cancelled.
 *
 * @class BookingAlreadyCancelledError
 * @extends {Error}
 * */
export class BookingAlreadyCancelledError extends Error {
    /**
     * Creates an instance of BookingAlreadyCancelledError.
     *
     * @param {number} id The ID of the booking on which the operation was attempted
     */
    constructor(id: number) {
        super(`Booking with ID ${id} has already been cancelled`);
        this.name = "BookingAlreadyCancelledError";
    }
}
