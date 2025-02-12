import { NextFunction, Request, Response } from "express";
import { validateLoginRequest } from "../middleware/validators/auth";
import { User } from "../models/user/User";
import { AuthenticationError } from "../errors/AuthenticationError";
import jwt from "jsonwebtoken";
import { AuthenticatedResponse } from "../types/auth";

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const loginRequest = validateLoginRequest(req.body);

        if (await User.validatePassword(loginRequest.email, loginRequest.password)) {
            const user = await User.getByEmail(loginRequest.email);
            const token = jwt.sign({ id: user.getId(), email: user.getEmail() }, process.env.JWT_SECRET || "", {
                expiresIn: "1h",
            });
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
