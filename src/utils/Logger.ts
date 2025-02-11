import { Request, Response } from "express";
import { ErrorLog, InfoLog, RequestLog, ResponseLog } from "../types/Log";

/**
 * Class to log requests, responses, errors, and info messages
 */
export class Logger {
    /**
     * Logs a request
     *
     * @param req - The request object
     */
    public static logRequest(req: Request) {
        const requestUUID = req.headers["x-request-id"] as string;
        const start = Date.now();
        const ipAddress = req.ip;

        const requestLog: RequestLog = {
            timestamp: getTimestamp(start),
            requestUUID: requestUUID,
            logType: "request",
            ipAddress: ipAddress,
            method: req.method,
            url: req.url,
            body: req.body,
        };
        console.log(JSON.stringify(requestLog));
    }

    /**
     * Logs a response
     *
     * @param req - The request object
     * @param res - The response object
     * @param duration - The duration of the request
     * @param responseBody - The body of the response
     */
    public static logResponse(req: Request, res: Response, duration: number, responseBody: string) {
        const requestUUID = req.headers["x-request-id"] as string;
        const end = Date.now();

        const responseLog: ResponseLog = {
            timestamp: getTimestamp(end),
            requestUUID: requestUUID,
            logType: "response",
            duration: duration + "ms",
            statusCode: res.statusCode,
            body: responseBody,
        };
        console.log(JSON.stringify(responseLog));
    }

    /**
     * Logs an error
     *
     * @param req - The request object
     * @param error - The error to be logged
     */
    public static logError(req: Request, error: Error): void {
        const errorLog: ErrorLog = {
            timestamp: getTimestamp(Date.now()),
            requestUUID: req.headers["x-request-id"] as string,
            logType: "error",
            error: error.message,
            stack: error.stack,
        };
        console.log(JSON.stringify(errorLog));
    }

    /**
     * Logs an info message
     *
     * @param req - The request object
     * @param message - The info message
     */
    public static logInfo(req: Request, message: string): void {
        const infoLog: InfoLog = {
            timestamp: getTimestamp(Date.now()),
            requestUUID: req.headers["x-request-id"] as string,
            logType: "info",
            message: message,
        };
        console.log(JSON.stringify(infoLog));
    }
}

function getTimestamp(date: number) {
    return new Date(date).toISOString();
}
