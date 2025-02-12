import fs from "fs";
import path from "path";
import { TEST_EVENT_1, TEST_USER_1 } from "../test-data";
import { BookingStatus, PrismaClient } from "@prisma/client";

export function loadEnvVariables(filePath: string) {
    const envConfig = fs.readFileSync(path.resolve(__dirname, filePath));
    const envConfigString = envConfig.toString();
    const envConfigLines = envConfigString.split("\n");
    envConfigLines.forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join("=").trim();
        }
    });
}

export async function createTestUser(): Promise<number> {
    const prisma = new PrismaClient();
    const randomEmail = Math.random().toString(36).substring(7) + "@test.com";
    const newUser = await prisma.user.create({
        data: {
            email: randomEmail,
            password: TEST_USER_1.password,
            firstName: TEST_USER_1.firstName,
            lastName: TEST_USER_1.lastName,
        },
    });
    prisma.$disconnect();
    return newUser.id;
}

export async function createTestEvent(ticketLimit: number = 10): Promise<number> {
    const prisma = new PrismaClient();
    const newEvent = await prisma.event.create({
        data: {
            name: TEST_EVENT_1.name,
            description: TEST_EVENT_1.description,
            location: TEST_EVENT_1.location,
            date: new Date(),
            ticketLimit: ticketLimit,
            price: TEST_EVENT_1.price,
        },
    });
    prisma.$disconnect();
    return newEvent.id;
}

export async function createTestBooking(
    userId: number,
    eventId: number,
    status: BookingStatus = "CONFIRMED",
): Promise<number> {
    const prisma = new PrismaClient();
    const newBooking = await prisma.booking.create({
        data: {
            userId,
            eventId,
            status,
        },
    });
    prisma.$disconnect();
    return newBooking.id;
}
