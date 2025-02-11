import {EntityNotFoundError} from "./EntityNotFoundError";

export class BookingNotFoundError extends EntityNotFoundError {
    constructor(id: number) {
        super("Ticket", id);
        this.name = 'EventNotFoundError';
    }
}