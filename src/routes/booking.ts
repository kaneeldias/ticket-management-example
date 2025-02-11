import {NextFunction, Request, Response} from "express";
import {Event} from "../models/event/Event";
import {User} from "../models/user/User";
import {Booking} from "../models/booking/Booking";
import {validateBookingRequest, validateCancelBookingRequest} from "../middleware/validators/booking";
import {AddedToWaitingListResponse, BookingCancelledResponse, TicketCreatedResponse} from "../types/booking";

export async function createBooking(req: Request, res: Response, next: NextFunction ): Promise<void> {
    try {
        const createBookingRequest = validateBookingRequest(req.body);
        const event = await Event.getById(createBookingRequest.eventId);
        const user = await User.getById(createBookingRequest.userId);
        
        if (await user.hasTicket(event)) {
            res.status(400).json({ error: 'User already has a booking' });
            return;
        }
        
        if (await user.isOnWaitList(event)) {
            res.status(400).json({ error: 'User is already on wait list' });
            return;
        }
        
        if (await event.isSoldOut()) {
            const wait = await Booking.addToWaitlist(event, user);
            
            const response: AddedToWaitingListResponse = {
                message: 'Event is sold out. User added to wait list',
                wait: wait
            }
            res.status(201).json(response);
            return;
        }
        
        const ticket = await Booking.createTicket(event, user);
        
        const response: TicketCreatedResponse = {
            message: 'Ticket booked successfully',
            ticket: ticket
        }
        res.status(201).json(response);
        
        return;
    } catch (err) {
        next(err);
    }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction ): Promise<void> {
    try {
        const cancelBookingRequest = validateCancelBookingRequest(req.body);
        const ticket = await Booking.getById(cancelBookingRequest.id);
        const updatedTicket = await ticket.cancel();
        
        const response: BookingCancelledResponse = {
            message: 'Booking cancelled successfully',
            booking: updatedTicket
        }
        res.status(200).json(response);
        
        const event = await ticket.getEvent();
        await event.bumpWaitList();
        
        return;
    } catch (err) {
        next(err);
    }
}