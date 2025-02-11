/**
 * Error thrown when an entity is not found in the database
 *
 * @class EntityNotFoundError
 * @extends {Error}
 */
export class EntityNotFoundError extends Error {
    /**
     * Creates an instance of EntityNotFoundError.
     *
     * @param {string} type The type of the entity
     * @param {number} id The ID of the entity that was not found
     */
    constructor(type: string, id: number) {
        super(`${type} with ID ${id} not found`);
        this.name = "EventNotFoundError";
    }
}
