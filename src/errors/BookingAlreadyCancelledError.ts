export class BookingAlreadyCancelledError extends Error {
    constructor(id: number) {
        super(`Booking with id ${id} has already been cancelled`);
        this.name = 'BookingAlreadyCancelledError';
    }
}