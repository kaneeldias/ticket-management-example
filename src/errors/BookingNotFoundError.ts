import {EntityNotFoundError} from "./EntityNotFoundError";

export class BookingNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super("Ticket", id);
        this.name = 'EventNotFoundError';
    }
}