import { PrismaClient } from "@prisma/client";
import { UserNotFoundError } from "../../errors/UserNotFoundError";
import { Event } from "../event/Event";

const prisma = new PrismaClient();

export class User {
    private readonly id: number;
    private readonly email: string;
    private readonly password: string;
    private readonly firstName: string;
    private readonly lastName: string;

    private constructor(id: number, email: string, password: string, firstName: string, lastName: string) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public static async getById(id: number): Promise<User> {
        const user = await prisma.user.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new UserNotFoundError(id);
        }
        return new User(user.id, user.email, user.password, user.firstName, user.lastName);
    }

    public getId(): number {
        return this.id;
    }

    public async hasTicket(event: Event): Promise<Boolean> {
        const ticket = await prisma.booking.findFirst({
            where: {
                userId: this.id,
                eventId: event.getId(),
                status: "CONFIRMED",
                deletedAt: null,
            },
        });
        return !!ticket;
    }

    public async isOnWaitList(event: Event): Promise<Boolean> {
        const wait = await prisma.booking.findFirst({
            where: {
                userId: this.id,
                eventId: event.getId(),
                status: "PENDING",
                deletedAt: null,
            },
        });
        return !!wait;
    }
}
