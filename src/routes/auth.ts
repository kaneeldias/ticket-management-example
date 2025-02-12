import { NextFunction, Request, Response } from "express";
import { validateLoginRequest } from "../middleware/validators/auth";
import { AuthenticationError } from "../errors/AuthenticationError";
import { AuthenticatedResponse } from "../types/auth";
import { generateToken, validatePassword } from "../middleware/auth";

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loginRequest = validateLoginRequest(req.body);

        if (await validatePassword(loginRequest.email, loginRequest.password)) {
            const token = await generateToken(loginRequest.email);
            const response: AuthenticatedResponse = {
                token: token,
            };

            res.status(200).json(response);
            return;
        } else {
            next(new AuthenticationError());
        }
    } catch (err) {
        next(err);
    }
}
