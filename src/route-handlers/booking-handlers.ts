import {NextFunction, Request, Response} from "express";
import {validateBookingRequest, validateCancelBookingRequest} from "../models/booking/booking-utils";
import {Event} from "../models/event/Event";
import {User} from "../models/user/User";
import {Booking} from "../models/booking/Booking";

export async function createBooking(req: Request, res: Response, next: NextFunction ): Promise<any> {
    try {
        const createBookingRequest = validateBookingRequest(req.body);
        const event = await Event.getById(createBookingRequest.eventId);
        const user = await User.getById(createBookingRequest.userId);
        
        if (await user.hasTicket(event)) {
            return res.status(400).json({ error: 'User already has a booking' });
        }
        
        if (await user.isOnWaitList(event)) {
            return res.status(400).json({ error: 'User is already on wait list' });
        }
        
        if (await event.isSoldOut()) {
            const wait = await Booking.addToWaitlist(event, user);
            return res.status(201).json({
                message: 'Event is sold out. User added to wait list',
                wait
            });
        }
        
        const ticket = await Booking.createTicket(event, user);
        res.status(201).json({
            message: 'Booking booked successfully',
            ticket
        });
    } catch (err) {
        next(err);
    }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction ): Promise<any> {
    try {
        const cancelBookingRequest = validateCancelBookingRequest(req.body);
        const ticket = await Booking.getById(cancelBookingRequest.id);
        const updatedTicket = await ticket.cancel();
        res.status(200).json({
            message: 'Booking cancelled successfully',
            updatedTicket
        });
        
        const event = await ticket.getEvent();
        await event.bumpWaitList();
    } catch (err) {
        next(err);
    }
}