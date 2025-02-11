export class EntityNotFoundError extends Error {
    constructor(type: string, id: number) {
        super(`${type} with id ${id} not found`);
        this.name = 'EventNotFoundError';
    }
}