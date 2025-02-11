/**
 * Error thrown when an attempt is made to book a ticket for an event that is sold out.
 *
 * @class EventSoldOutError
 * @extends {Error}
 */
export class EventSoldOutError extends Error {
    /**
     * Creates an instance of EventSoldOutError.
     *
     * @param {number} id The ID of the event
     */
    constructor(id: number) {
        super(`Event with ID ${id} is sold out`);
        this.name = "EventSoldOutError";
    }
}
