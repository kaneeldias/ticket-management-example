import { Event } from "./Event";
import { prisma } from "../utils/db";
import { UserNotFoundError } from "../errors/UserNotFoundError";

/**
 * Represents a user
 */
export class User {
    private readonly id: number;
    private readonly email: string;
    private readonly firstName: string;
    private readonly lastName: string;

    private constructor(id: number, email: string, firstName: string, lastName: string) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    /**
     * Retrieves a user by their ID
     *
     * @param id - The ID of the user to be retrieved
     * @returns The user with the specified ID
     */
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
        return new User(user.id, user.email, user.firstName, user.lastName);
    }

    /**
     * Retrieves a user by their email
     *
     * @param email - The email of the user to be retrieved
     * @returns The user with the specified email
     */
    public static async getByEmail(email: string): Promise<User> {
        const user = await prisma.user.findUnique({
            where: {
                email,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new UserNotFoundError(email);
        }
        return new User(user.id, user.email, user.firstName, user.lastName);
    }

    /**
     * Retrieves the ID of the user
     *
     * @returns The ID of the user
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Retrieves the email of the user
     *
     * @returns The email of the user
     */
    public getEmail(): string {
        return this.email;
    }

    /**
     * Checks if the user has a ticket for an event
     *
     * @param event - The event to check if the user has a ticket for
     * @returns True if the user has a ticket for the event, false otherwise
     */
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

    /**
     * Checks if the user is on the wait list for an event
     *
     * @param event - The event to check if the user is on the wait list for
     * @returns True if the user is on the wait list for the event, false otherwise
     */
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
