import { EntityNotFoundError } from "./EntityNotFoundError";

/**
 * Error thrown when an attempt is made to retrieve a booking that does not exist.
 *
 * @class BookingNotFoundError
 * @extends {EntityNotFoundError}
 */
export class BookingNotFoundError extends EntityNotFoundError {
    /**
     * Creates an instance of BookingNotFoundError.
     *
     * @param {number} id The ID of the booking that was not found
     */
    constructor(id: number) {
        super("Booking", id);
        this.name = "EventNotFoundError";
    }
}
