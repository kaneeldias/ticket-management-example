import { NextFunction, Request, Response } from "express";
import { Event } from "../models/event/Event";
import { validateCreateEventRequest, validateEventStatusRequest } from "../middleware/validators/event";
import { EventCreatedResponse, EventStatusResponse } from "../types/event";
import { Logger } from "../utils/Logger";

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const createEventRequest = validateCreateEventRequest(req.body);
        const event = await Event.create(createEventRequest);
        Logger.logInfo(req, `Event created: ${event.getId()}`);

        const response: EventCreatedResponse = {
            message: "Event created successfully",
            event: event,
        };
        res.status(201).json(response);
        return;
    } catch (err) {
        next(err);
    }
}

export async function getEventStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const eventStatusRequest = validateEventStatusRequest(req.params);
        const event = await Event.getById(eventStatusRequest.eventId);

        const response: EventStatusResponse = {
            event: event,
            ticketsAvailable: await event.getTicketsAvailableCount(),
            waitingListCount: await event.getWaitingListCount(),
        };
        res.status(200).json(response);
        return;
    } catch (err) {
        next(err);
    }
}
