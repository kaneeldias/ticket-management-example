import {ValidationError} from "joi";
import {EntityNotFoundError} from "../errors/EntityNotFoundError";
import {Request, Response } from "express";

export async function errorHandler(err: Error, req: Request, res: Response) {
    if (err instanceof ValidationError) {
        res.status(400).json({error: err.message});
    }
    
    if (err instanceof EntityNotFoundError) {
        res.status(404).json({error: err.message});
    }
    
    console.error(err.stack);
    res.status(500).json({error: "An unknown error occurred"});
}
