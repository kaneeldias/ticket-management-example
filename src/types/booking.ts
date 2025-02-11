import {Booking} from "../models/booking/Booking";

export type CreateBookingRequest = {
    eventId: string;
    userId: string;
}

export type AddedToWaitingListResponse = {
    message: string;
    wait: Booking;
}

export type TicketCreatedResponse = {
    message: string;
    ticket: Booking;
}

export type CancelBookingRequest = {
    id: string;
}

export type BookingCancelledResponse = {
    message: string;
    booking: Booking;
}
