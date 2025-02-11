import { Booking } from "../models/booking/Booking";

export type CreateBookingRequest = {
    eventId: number;
    userId: number;
};

export type AddedToWaitingListResponse = {
    message: string;
    wait: Booking;
};

export type TicketCreatedResponse = {
    message: string;
    ticket: Booking;
};

export type CancelBookingRequest = {
    id: number;
};

export type BookingCancelledResponse = {
    message: string;
    booking: Booking;
};
