import { Request, Response, NextFunction } from 'express';
import {randomUUID} from "node:crypto";
import {Logger} from "../utils/Logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    req.headers['x-request-id'] = randomUUID();
    Logger.logRequest(req);
    
    let originalJson = res.json;
    let responseBody: any;
    
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    
    res.on('finish', () => {
        const end = Date.now();
        const duration = end - start;
        Logger.logResponse(req, res, duration, responseBody);
    });
    
    next();
}
