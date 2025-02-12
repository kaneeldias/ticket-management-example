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
     * @param {string} [field="ID"] The field used to search for the entity
     */
    constructor(type: string, id: number | string, field: string = "ID") {
        super(`${type} with ${field} ${id} not found`);
        this.name = "EventNotFoundError";
    }
}
