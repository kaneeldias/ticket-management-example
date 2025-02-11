import {EntityNotFoundError} from "./EntityNotFoundError";

export class EventNotFoundError extends EntityNotFoundError {
    constructor(id: number) {
        super("Event", id);
        this.name = 'EventNotFoundError';
    }
}