import { ValidationError } from "joi";
import { EntityNotFoundError } from "../errors/EntityNotFoundError";
import { NextFunction, Request, Response } from "express";
import { BookingAlreadyCancelledError } from "../errors/BookingAlreadyCancelledError";
import { Logger } from "../utils/Logger";

export async function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
    Logger.logError(req, err);

    if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof BookingAlreadyCancelledError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof EntityNotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: "An unknown error occurred" });
    return;
}
