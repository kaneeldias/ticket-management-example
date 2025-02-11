import { EntityNotFoundError } from "./EntityNotFoundError";

/**
 * Error thrown when an attempt is made to retrieve an event that does not exist.
 *
 * @class EventNotFoundError
 * @extends {EntityNotFoundError}
 */
export class EventNotFoundError extends EntityNotFoundError {
    /**
     * Creates an instance of EventNotFoundError.
     *
     * @param {number} id The ID of the event
     */
    constructor(id: number) {
        super("Event", id);
        this.name = "EventNotFoundError";
    }
}
