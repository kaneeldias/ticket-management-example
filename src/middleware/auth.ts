import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { AuthenticationError } from "../errors/AuthenticationError";
import { JWTDecoded } from "../types/auth";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { User } from "../models/User";

/**
 * Middleware to verify if the user is logged in
 *
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function in the control flow
 */
export async function verifyLoggedIn(req: Request, res: Response, next: NextFunction) {
    try {
        await getToken(req);
        next();
    } catch (error) {
        next(new AuthenticationError());
    }
}

/**
 * Middleware to verify if the user is logged in and is the same as the userId
 *
 * @param req - Request object
 * @param userId - User ID
 */
export async function verifyLoggedInUser(req: Request, userId: number): Promise<void> {
    const token = await getToken(req);
    if (token.id !== userId) {
        throw new AuthenticationError();
    }
}

/**
 * Get the token from the request and verifies it
 *
 * @param req - Request object
 */
async function getToken(req: Request): Promise<JWTDecoded> {
    const token = req.header("Authorization");
    if (!token) {
        throw new AuthenticationError();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    const userId = (decoded as any).id;
    const email = (decoded as any).email;
    await verifyUserToken(userId, email);

    return {
        id: userId,
        email: email,
    };
}

/**
 * Verify if the user token is valid
 *
 * @param userId - User ID contained in the token
 * @param email - Email contained in the token
 */
async function verifyUserToken(userId: number, email: string) {
    const emailInDb = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            email: true,
        },
    });
    if (!emailInDb) throw new AuthenticationError();
    if (emailInDb.email !== email) throw new AuthenticationError();
}

/**
 * Validates the password of a user
 *
 * @param email - The email of the user
 * @param password - The password to validate
 */
export async function validatePassword(email: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        select: {
            password: true,
        },
        where: {
            email: email,
            deletedAt: null,
        },
    });

    if (!user) {
        throw new UserNotFoundError(email);
    }

    return user.password === password;
}

/**
 * Generates a JWT token for a user
 *
 * @param email - The email of the user
 */
export async function generateToken(email: string): Promise<string> {
    const user = await User.getByEmail(email);
    return jwt.sign(
        {
            id: user.getId(),
            email: user.getEmail(),
        },
        process.env.JWT_SECRET || "",
        {
            expiresIn: "1h",
        },
    );
}
