import { Request, Response } from 'express';
import {ErrorLog, InfoLog, RequestLog} from "../types/Log";

export class Logger {
    public static logRequest(req: Request): void {
        const requestUUID = req.headers['x-request-id'] as string;
        const start = Date.now();
        const ipAddress = req.ip;
        
        const requestLog: RequestLog = {
            timestamp: getTimestamp(start),
            requestUUID: requestUUID,
            logType: "request",
            ipAddress: ipAddress,
            method: req.method,
            url: req.url,
            body: req.body
        }
        console.log(JSON.stringify(requestLog));
    }
    
    public static logResponse(req: Request, res: Response, duration: number, responseBody: string): void {
        const requestUUID = req.headers['x-request-id'] as string;
        const end = Date.now();
        
        const responseLog = {
            timestamp: getTimestamp(end),
            requestUUID: requestUUID,
            logType: "response",
            duration: duration + "ms",
            statusCode: res.statusCode,
            body: responseBody
        }
        console.log(JSON.stringify(responseLog));
    }
    
    public static logError(req: Request, error: Error): void {
        const errorLog: ErrorLog = {
            timestamp: getTimestamp(Date.now()),
            requestUUID: req.headers['x-request-id'] as string,
            logType: "error",
            error: error.message,
            stack: error.stack
        }
        console.log(JSON.stringify(errorLog));
    }
    
    public static logInfo(req: Request, message: string): void {
        const infoLog: InfoLog = {
            timestamp: getTimestamp(Date.now()),
            requestUUID: req.headers['x-request-id'] as string,
            logType: "info",
            message: message
        }
        console.log(JSON.stringify(infoLog));
    }
}

function getTimestamp(date: number) {
    return new Date(date).toISOString();
}