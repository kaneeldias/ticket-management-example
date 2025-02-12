import { NextFunction, Request, Response } from "express";
import { Event } from "../models/event/Event";
import { User } from "../models/user/User";
import { Booking } from "../models/booking/Booking";
import { validateBookingRequest, validateCancelBookingRequest } from "../middleware/validators/booking";
import { AddedToWaitingListResponse, BookingCancelledResponse, TicketCreatedResponse } from "../types/booking";
import { Logger } from "../utils/Logger";
import { verifyLoggedInUser } from "../middleware/auth";

export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const createBookingRequest = validateBookingRequest(req.body);
        await verifyLoggedInUser(req, createBookingRequest.userId);

        const user = await User.getById(createBookingRequest.userId);
        const event = await Event.getById(createBookingRequest.eventId);

        if (await user.hasTicket(event)) {
            res.status(400).json({ error: "User already has a booking" });
            return;
        }

        if (await user.isOnWaitList(event)) {
            res.status(400).json({ error: "User is already on wait list" });
            return;
        }

        if (await event.isSoldOut()) {
            const wait = await Booking.addToWaitlist(event, user);
            Logger.logInfo(req, `Added to waitlist: ${wait.getId()}`);

            const response: AddedToWaitingListResponse = {
                message: "Event is sold out. User added to wait list",
                wait: wait,
            };
            res.status(201).json(response);
            return;
        }

        const ticket = await Booking.createTicket(event, user);
        Logger.logInfo(req, `Ticket created: ${ticket.getId()}`);

        const response: TicketCreatedResponse = {
            message: "Ticket booked successfully",
            ticket: ticket,
        };
        res.status(201).json(response);
        return;
    } catch (err) {
        next(err);
    }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const cancelBookingRequest = validateCancelBookingRequest(req.body);
        const booking = await Booking.getById(cancelBookingRequest.id);
        const updatedTicket = await booking.cancel();

        // Ideally this should be done as a background job
        const event = await booking.getEvent();
        await event.bumpWaitList();

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
