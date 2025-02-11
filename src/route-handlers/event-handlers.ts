import {NextFunction, Request, Response} from "express";
import {validateCreateEventRequest} from "../models/event/event-utils";
import {Event} from "../models/event/Event";

export async function createEvent(req: Request, res: Response, next: NextFunction) {
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
}
