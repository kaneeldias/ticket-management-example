import { EntityNotFoundError } from "./EntityNotFoundError";

export class BookingNotFoundError extends EntityNotFoundError {
    constructor(id: number) {
        super("Booking", id);
        this.name = "EventNotFoundError";
    }
}
