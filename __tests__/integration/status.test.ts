import { TEST_EVENT_1 } from "../test-data";
import { PrismaClient } from "@prisma/client";
import { createTestBooking, createTestEvent, createTestUser, loadEnvVariables } from "./test-utils";

let prisma: PrismaClient;
let ENDPOINT: string;

describe("Testing POST /status/:eventId", () => {
    beforeAll((done) => {
        jest.resetModules();
        loadEnvVariables(".env.test");
        prisma = new PrismaClient();
        ENDPOINT = `http://localhost:${process.env.PORT}`;
        done();
    });

    afterAll((done) => {
        prisma.$disconnect().finally(done());
    });

    test("Get event status with no bookings", async () => {
        const eventId = await createTestEvent();

        const response = await fetch(`${ENDPOINT}/status/${eventId}`);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.event.id).toBe(eventId);
        expect(responseBody.ticketsAvailable).toBe(TEST_EVENT_1.ticketLimit);
        expect(responseBody.waitingListCount).toBe(0);
    });

    test("Get event status with one booking", async () => {
        const eventId = await createTestEvent();
        const userId = await createTestUser();
        await createTestBooking(userId, eventId);

        const response = await fetch(`${ENDPOINT}/status/${eventId}`);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.event.id).toBe(eventId);
        expect(responseBody.ticketsAvailable).toBe(TEST_EVENT_1.ticketLimit - 1);
        expect(responseBody.waitingListCount).toBe(0);
    });

    test("Get event status with multiple bookings", async () => {
        const eventId = await createTestEvent(10);
        for (let i = 0; i < 5; i++) {
            const userId = await createTestUser();
            await createTestBooking(userId, eventId);
        }

        const response = await fetch(`${ENDPOINT}/status/${eventId}`);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.event.id).toBe(eventId);
        expect(responseBody.ticketsAvailable).toBe(5);
        expect(responseBody.waitingListCount).toBe(0);
    });

    test("Get event status with all tickets booked", async () => {
        const eventId = await createTestEvent(10);
        for (let i = 0; i < 10; i++) {
            const userId = await createTestUser();
            await createTestBooking(userId, eventId);
        }

        const response = await fetch(`${ENDPOINT}/status/${eventId}`);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.event.id).toBe(eventId);
        expect(responseBody.ticketsAvailable).toBe(0);
        expect(responseBody.waitingListCount).toBe(0);
    });

    test("Get event status with all tickets booked and waiting list", async () => {
        const eventId = await createTestEvent(10);
        for (let i = 0; i < 10; i++) {
            const userId = await createTestUser();
            await createTestBooking(userId, eventId);
        }

        for (let i = 0; i < 5; i++) {
            const userId = await createTestUser();
            await createTestBooking(userId, eventId, "PENDING");
        }

        const response = await fetch(`${ENDPOINT}/status/${eventId}`);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.event.id).toBe(eventId);
        expect(responseBody.ticketsAvailable).toBe(0);
        expect(responseBody.waitingListCount).toBe(5);
    });

    test("Get event status with invalid event ID", async () => {
        const response = await fetch(`${ENDPOINT}/status/invalid`);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe('"eventId" must be a number');
    });

    test("Get event status with non-existent event ID", async () => {
        const response = await fetch(`${ENDPOINT}/status/1000`);
        const responseBody = await response.json();

        expect(response.status).toBe(404);
        expect(responseBody.error).toBe("Event with ID 1000 not found");
    });
});
