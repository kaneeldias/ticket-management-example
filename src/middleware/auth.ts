import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/db";
import { AuthenticationError } from "../errors/AuthenticationError";

export async function verifyLoggedIn(req: Request, res: Response, next: NextFunction) {
    const token = req.header("Authorization");
    if (!token) {
        next(new AuthenticationError());
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        const userId = (decoded as any).userId;
        const email = (decoded as any).email;
        await verifyUser(userId, email);
        next();
    } catch (error) {
        next(error);
    }
}

async function verifyUser(userId: number, email: string) {
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
