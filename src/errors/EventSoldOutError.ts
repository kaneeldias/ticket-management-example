export class EventSoldOutError extends Error {
    constructor(id: number) {
        super(`Event with ID ${id} is sold out`);
        this.name = "EventSoldOutError";
    }
}
