import {ValidationError} from "joi";
import {EntityNotFoundError} from "../errors/EntityNotFoundError";
import {NextFunction, Request, Response} from "express";
import {BookingAlreadyCancelledError} from "../errors/BookingAlreadyCancelledError";

export async function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
    if (err instanceof ValidationError) {
        res.status(400).json({error: err.message});
        return;
    }
    
    if (err instanceof BookingAlreadyCancelledError) {
        res.status(400).json({error: err.message});
        return;
    }
    
    if (err instanceof EntityNotFoundError) {
        res.status(404).json({error: err.message});
        return;
    }
    
    console.error(err.stack);
    res.status(500).json({error: "An unknown error occurred"});
    return;
}
