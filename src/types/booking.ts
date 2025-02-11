/**
 * This file contains all the types related to bookings.
 */

import { Booking } from "../models/booking/Booking";

/**
 * Request to create a booking.
 *
 * @property eventId - The ID of the event to book.
 * @property userId - The ID of the user booking the event.
 */
export type CreateBookingRequest = {
    eventId: number;
    userId: number;
};

/**
 * Response when a user is added to the waiting list.
 *
 * @property message - A message indicating the user was added to the waiting list.
 * @property wait - The booking that was added to the waiting list.
 */
export type AddedToWaitingListResponse = {
    message: string;
    wait: Booking;
};

/**
 * Response when a ticket is created.
 *
 * @property message - A message indicating the ticket was created.
 * @property ticket - The ticket that was created.
 */
export type TicketCreatedResponse = {
    message: string;
    ticket: Booking;
};

/**
 * Request to cancel a booking.
 *
 * @property id - The ID of the booking to cancel.
 */
export type CancelBookingRequest = {
    id: number;
};

/**
 * Response when a booking is cancelled.
 *
 * @property message - A message indicating the booking was cancelled.
 * @property booking - The booking that was cancelled.
 */
export type BookingCancelledResponse = {
    message: string;
    booking: Booking;
};
