/**
 * This file contains all the types related to bookings.
 */

import { Booking } from "../models/Booking";

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
 * Response when a booking is created.
 *
 * @property message - A message indicating whether the ticket was created or the user was added to the waiting list.
 * @property booking - The ticket that was created.
 */
export type BookingCreatedResponse = {
    message: string;
    booking: Booking;
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
