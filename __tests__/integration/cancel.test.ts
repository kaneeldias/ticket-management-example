import { PrismaClient } from "@prisma/client";
import { createTestBooking, createTestEvent, createTestUser, loadEnvVariables } from "./test-utils";
import request from "supertest";
import app from "../../src/app";

let prisma: PrismaClient;

jest.setTimeout(10000);

jest.mock("../../src/middleware/auth", () => {
    return {
        verifyLoggedIn: jest.fn().mockImplementation((_, __, next) => {
            next();
        }),
        verifyLoggedInUser: jest.fn().mockImplementation((_, __) => {
            return true;
        }),
    };
});

describe("Testing POST /cancel", () => {
    beforeAll((done) => {
        jest.resetModules();
        loadEnvVariables(".env.test");
        prisma = new PrismaClient();
        done();
    });

    afterAll((done) => {
        prisma.$disconnect().finally(done());
    });

    test("Cancel a booking", async () => {
        const userId = await createTestUser();
        const eventId = await createTestEvent();
        const bookingId = await createTestBooking(userId, eventId);

        const response = await request(app).post("/cancel").send({
            id: bookingId,
        });
        const responseBody = response.body;

        expect(response.status).toBe(200);
        expect(responseBody.message).toBe("Booking cancelled successfully");
        expect(responseBody.booking.id).toBe(bookingId);
        expect(responseBody.booking.userId).toBe(userId);
        expect(responseBody.booking.eventId).toBe(eventId);
        expect(responseBody.booking.status).toBe("CANCELLED");

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });
        expect(booking).not.toBeNull();
        expect(booking?.status).toBe("CANCELLED");
        expect(booking?.userId).toBe(userId);
        expect(booking?.eventId).toBe(eventId);
    });

    test("Cancel a booking that does not exist", async () => {
        const response = await request(app).post("/cancel").send({
            id: 9999,
        });
        const responseBody = response.body;

        expect(response.status).toBe(404);
        expect(responseBody.error).toBe("Booking with ID 9999 not found");
    });

    test("Cancel a booking that is already cancelled", async () => {
        const userId = await createTestUser();
        const eventId = await createTestEvent();
        const bookingId = await createTestBooking(userId, eventId, "CANCELLED");

        const response = await request(app).post("/cancel").send({
            id: bookingId,
        });
        const responseBody = response.body;

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe(`Booking with ID ${bookingId} has already been cancelled`);
    });

    test("Cancel a booking in waiting list", async () => {
        const userId = await createTestUser();
        const eventId = await createTestEvent(10);
        const bookingId = await createTestBooking(userId, eventId, "PENDING");

        const response = await request(app).post("/cancel").send({
            id: bookingId,
        });
        const responseBody = response.body;

        expect(response.status).toBe(200);
        expect(responseBody.message).toBe("Booking cancelled successfully");
        expect(responseBody.booking.id).toBe(bookingId);
        expect(responseBody.booking.userId).toBe(userId);
        expect(responseBody.booking.eventId).toBe(eventId);
        expect(responseBody.booking.status).toBe("CANCELLED");

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });
        expect(booking).not.toBeNull();
        expect(booking?.status).toBe("CANCELLED");
        expect(booking?.userId).toBe(userId);
        expect(booking?.eventId).toBe(eventId);
    });

    test("Cancel a booking and bump one from waiting list", async () => {
        const eventId = await createTestEvent(10);
        let bookingId1, userId1;
        for (let i = 0; i < 10; i++) {
            userId1 = await createTestUser();
            bookingId1 = await createTestBooking(userId1, eventId, "CONFIRMED");
        }
        const userId2 = await createTestUser();
        const bookingId2 = await createTestBooking(userId2, eventId, "PENDING");

        const response = await request(app).post("/cancel").send({
            id: bookingId1,
        });
        const responseBody = response.body;

        expect(response.status).toBe(200);
        expect(responseBody.message).toBe("Booking cancelled successfully");
        expect(responseBody.booking.status).toBe("CANCELLED");

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId1 },
        });
        expect(booking).not.toBeNull();
        expect(booking?.status).toBe("CANCELLED");
        expect(booking?.userId).toBe(userId1);
        expect(booking?.eventId).toBe(eventId);

        // wait 1s for the waitlist bump to happen
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const booking2 = await prisma.booking.findUnique({
            where: { id: bookingId2 },
        });
        expect(booking2).not.toBeNull();
        expect(booking2?.status).toBe("CONFIRMED");
        expect(booking2?.userId).toBe(userId2);
        expect(booking2?.eventId).toBe(eventId);
    });

    test("Cancel many bookings when many users are on waiting list", async () => {
        const eventId = await createTestEvent(10);

        const originalUserIds = [];
        const originalBookingIds = [];
        for (let i = 0; i < 10; i++) {
            const userId = await createTestUser();
            originalUserIds.push(userId);
            const bookingId = await createTestBooking(userId, eventId, "CONFIRMED");
            originalBookingIds.push(bookingId);
        }

        const userIds = [];
        const bookingIds = [];
        for (let i = 0; i < 5; i++) {
            const userId = await createTestUser();
            userIds.push(userId);
            const bookingId = await createTestBooking(userId, eventId, "PENDING");
            bookingIds.push(bookingId);
        }

        for (let i = 0; i < 5; i++) {
            const response = await request(app).post("/cancel").send({
                id: originalBookingIds[i],
            });
            const responseBody = response.body;

            expect(response.status).toBe(200);
            expect(responseBody.message).toBe("Booking cancelled successfully");
            expect(responseBody.booking.status).toBe("CANCELLED");
            expect(responseBody.booking.userId).toBe(originalUserIds[i]);
            expect(responseBody.booking.eventId).toBe(eventId);
        }

        // wait 1s for the waitlist bump to happen
        await new Promise((resolve) => setTimeout(resolve, 1000));

        for (let i = 0; i < 5; i++) {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingIds[i] },
            });
            expect(booking).not.toBeNull();
            expect(booking?.status).toBe("CONFIRMED");
            expect(booking?.userId).toBe(userIds[i]);
            expect(booking?.eventId).toBe(eventId);
        }
    });

    test("Cancel many bookings but too many users on waiting list", async () => {
        const eventId = await createTestEvent(10);

        const originalUserIds = [];
        const originalBookingIds = [];
        for (let i = 0; i < 10; i++) {
            const userId = await createTestUser();
            originalUserIds.push(userId);
            const bookingId = await createTestBooking(userId, eventId, "CONFIRMED");
            originalBookingIds.push(bookingId);
        }

        const userIds = [];
        const bookingIds = [];
        for (let i = 0; i < 10; i++) {
            const userId = await createTestUser();
            userIds.push(userId);
            const bookingId = await createTestBooking(userId, eventId, "PENDING");
            bookingIds.push(bookingId);
        }

        for (let i = 0; i < 5; i++) {
            const response = await request(app).post("/cancel").send({
                id: originalBookingIds[i],
            });
            const responseBody = response.body;

            expect(response.status).toBe(200);
            expect(responseBody.message).toBe("Booking cancelled successfully");
            expect(responseBody.booking.status).toBe("CANCELLED");
            expect(responseBody.booking.userId).toBe(originalUserIds[i]);
            expect(responseBody.booking.eventId).toBe(eventId);
        }

        // wait 1s for the waitlist bump to happen
        await new Promise((resolve) => setTimeout(resolve, 1000));

        for (let i = 0; i < 10; i++) {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingIds[i] },
            });

            expect(booking).not.toBeNull();
            if (i < 5) {
                expect(booking?.status).toBe("CONFIRMED");
            } else {
                expect(booking?.status).toBe("PENDING");
            }
            expect(booking?.userId).toBe(userIds[i]);
            expect(booking?.eventId).toBe(eventId);
        }

        const confirmedCount = await prisma.booking.count({
            where: {
                eventId,
                status: "CONFIRMED",
            },
        });
        expect(confirmedCount).toBe(10);

        const pendingCount = await prisma.booking.count({
            where: {
                eventId,
                status: "PENDING",
            },
        });
        expect(pendingCount).toBe(5);
    });

    test("Cancel booking request with empty request body", async () => {
        const response = await request(app).post("/cancel").send();
        const responseBody = response.body;

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('"id" is required');
    });

    test("Cancel booking request with empty booking ID", async () => {
        const response = await request(app).post("/cancel").send({
            id: "",
        });
        const responseBody = response.body;

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('"id" must be a number');
    });
});
