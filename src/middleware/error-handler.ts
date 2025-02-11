import { ValidationError } from "joi";
import { EntityNotFoundError } from "../errors/EntityNotFoundError";
import { NextFunction, Request, Response } from "express";
import { BookingAlreadyCancelledError } from "../errors/BookingAlreadyCancelledError";
import { Logger } from "../utils/Logger";
import { BookingAlreadyConfirmedError } from "../errors/BookingAlreadyConfirmedError";

/**
 * Error handler middleware.
 * This handles all errors thrown in the application and sends an appropriate response to the client.
 * For known errors, the error message is sent to the client.
 * For unknown errors, a generic error message is sent to the client with HTTP status code 500.
 * The error is also logged.
 *
 * @param err The error that was thrown
 * @param req The request object
 * @param res The response object
 * @param _next The next flow control function
 */
export async function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
    Logger.logError(req, err);

    if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof BookingAlreadyCancelledError || err instanceof BookingAlreadyConfirmedError) {
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
