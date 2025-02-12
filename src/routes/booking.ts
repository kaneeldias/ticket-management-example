import { NextFunction, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { validateBookingRequest, validateCancelBookingRequest } from "../middleware/validators/booking";
import { AddedToWaitingListResponse, BookingCancelledResponse, TicketCreatedResponse } from "../types/booking";
import { Logger } from "../utils/Logger";
import { verifyLoggedInUser } from "../middleware/auth";
import BookingManager from "../utils/BookingManager";
import { UserAlreadyHasBookingError } from "../errors/UserAlreadyHasBookingError";
import { UserAlreadyOnWaitListError } from "../errors/UserAlreadyOnWaitListError";
import { BookingStatus } from "@prisma/client";

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const createBookingRequest = validateBookingRequest(req.body);
        await verifyLoggedInUser(req, createBookingRequest.userId);

        const booking = await BookingManager.createBooking(createBookingRequest.userId, createBookingRequest.eventId);
        const bookingStatus = await booking.getStatus();

        if (bookingStatus === BookingStatus.PENDING) {
            Logger.logInfo(req, `Added to waitlist: ${booking.getId()}`);

            const response: AddedToWaitingListResponse = {
                message: "Event is sold out. User added to wait list",
                wait: booking,
            };
            res.status(201).json(response);
            return;
        }

        Logger.logInfo(req, `Ticket created: ${booking.getId()}`);
        const response: TicketCreatedResponse = {
            message: "Ticket booked successfully",
            ticket: booking,
        };
        res.status(201).json(response);
        return;
    } catch (err) {
        if (err instanceof UserAlreadyHasBookingError) {
            res.status(400).json({ error: "User already has a booking" });
            return;
        }

        if (err instanceof UserAlreadyOnWaitListError) {
            res.status(400).json({ error: "User is already on wait list" });
            return;
        }

        next(err);
    }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cancelBookingRequest = validateCancelBookingRequest(req.body);
        const booking = await Booking.getById(cancelBookingRequest.id);
        const bookingUserId = (await booking.getUser()).getId();
        await verifyLoggedInUser(req, bookingUserId);

        const updatedTicket = await BookingManager.cancelBooking(cancelBookingRequest.id);

        const response: BookingCancelledResponse = {
            message: "Booking cancelled successfully",
            booking: updatedTicket,
        };
        res.status(200).json(response);

        return;
    } catch (err) {
        next(err);
    }
}
