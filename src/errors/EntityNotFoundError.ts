export class EntityNotFoundError extends Error {
    constructor(type: string, id: number) {
        super(`${type} with ID ${id} not found`);
        this.name = "EventNotFoundError";
    }
}
