export class BookingAlreadyCancelledError extends Error {
    constructor(id: number) {
        super(`Booking with ID ${id} has already been cancelled`);
        this.name = "BookingAlreadyCancelledError";
    }
}
