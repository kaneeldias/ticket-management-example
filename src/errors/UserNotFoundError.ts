import {EntityNotFoundError} from "./EntityNotFoundError";

export class UserNotFoundError extends EntityNotFoundError {
    constructor(id: string) {
        super("User", id);
        this.name = 'EventNotFoundError';
    }
}