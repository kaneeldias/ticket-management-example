import {EntityNotFoundError} from "./EntityNotFoundError";

export class TicketNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super("Ticket", id);
        this.name = 'EventNotFoundError';
    }
}