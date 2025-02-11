export class EventSoldOutError extends Error {
    constructor(id: number) {
        super(`Event with id ${id} is sold out`);
        this.name = 'EventSoldOutError';
    }
}