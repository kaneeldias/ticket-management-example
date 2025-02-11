import { EntityNotFoundError } from "./EntityNotFoundError";

export class UserNotFoundError extends EntityNotFoundError {
    constructor(id: number) {
        super("User", id);
        this.name = "EventNotFoundError";
    }
}
