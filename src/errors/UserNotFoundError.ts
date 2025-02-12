import { EntityNotFoundError } from "./EntityNotFoundError";

/**
 * Error thrown when an attempt is made to retrieve a user that does not exist.
 *
 * @class UserNotFoundError
 * @extends {EntityNotFoundError}
 */
export class UserNotFoundError extends EntityNotFoundError {
    /**
     * Creates an instance of UserNotFoundError.
     *
     * @param {number} id The ID of the user
     */
    constructor(id: number | string) {
        if (typeof id === "string") {
            super("User", id, "email");
        } else {
            super("User", id);
        }
        this.name = "UserNotFoundError";
    }
}
