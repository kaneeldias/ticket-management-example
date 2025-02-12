import { rateLimit } from "express-rate-limit";
import { NextFunction, Request, Response } from "express";

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    handler: function (req: Request, res: Response, _next: NextFunction) {
        res.status(429).json({ error: "Too many requests from this IP address" });
    },
});
