export class BookingAlreadyConfirmedError extends Error {
    constructor(id: number) {
        super(`Booking with ID ${id} has already been confirmed`);
        this.name = "BookingConfirmedError";
    }
}
