import {EntityNotFoundError} from "./EntityNotFoundError";

export class EventNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super("Event", id);
        this.name = 'EventNotFoundError';
    }
}