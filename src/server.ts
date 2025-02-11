import express, {NextFunction, Request, Response} from 'express';
import {Event} from "./models/event/Event";
import {
    validateBookingRequest,
    validateCancelBookingRequest,
    validateCreateEventRequest
} from "./models/event/event-utils";
import {User} from "./models/user/User";
import {EntityNotFoundError} from "./errors/EntityNotFoundError";
import {Booking} from "./models/booking/Booking";
import {ValidationError} from "joi";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json())

app.post('/initialize', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createEventRequest = validateCreateEventRequest(req.body);
        const event = await Event.create(createEventRequest);
        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (err) {
        next(err);
    }
});

app.post('/book',  async (req: Request, res: Response, next: NextFunction ): Promise<any> => {
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
});

app.post('/cancel',  async (req: Request, res: Response, next: NextFunction ): Promise<any> => {
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
});


//Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
    }
    
    if (err instanceof EntityNotFoundError) {
        res.status(404).json({ error: err.message });
    }
    
    console.error(err.stack);
    res.status(500).json({ error: "An unknown error occurred" });
});

app.listen(port);