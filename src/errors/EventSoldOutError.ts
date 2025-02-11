export class EventSoldOutError extends Error {
    constructor(id: string) {
        super(`Event with id ${id} is sold out`);
        this.name = 'EventSoldOutError';
    }
}