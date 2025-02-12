import { TEST_EVENT_1, TEST_USER_1 } from "../test-data";
import { PrismaClient } from "@prisma/client";
import { loadEnvVariables } from "./test-utils";

let prisma: PrismaClient;
let ENDPOINT: string;

describe("Testing POST /book", () => {
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

    test("Create booking with valid data", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: TEST_USER_1.id,
            }),
        });
        const body = await response.json();
        expect(response.status).toBe(201);

        expect(body.message).toBe("Ticket booked successfully");
        expect(body.ticket).toBeDefined();

        const ticket = body.ticket;
        expect(ticket.id).toBeDefined();
        expect(ticket.userId).toBe(TEST_USER_1.id);
        expect(ticket.eventId).toBe(TEST_EVENT_1.id);
        expect(ticket.status).toBe("CONFIRMED");

        const booking = await prisma.booking.findUnique({
            where: {
                id: ticket.id,
            },
        });
        expect(booking).toBeDefined();
        expect(booking?.userId).toBe(TEST_USER_1.id);
        expect(booking?.eventId).toBe(TEST_EVENT_1.id);
        expect(booking?.status).toBe("CONFIRMED");
    });

    test("Create booking with event ID that does not exist", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: 99999,
                userId: TEST_USER_1.id,
            }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Event with ID 99999 not found");
    });

    test("Create booking with user ID that does not exist", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: 99999,
            }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("User with ID 99999 not found");
    });

    test("Create booking with user already having a booking", async () => {
        await prisma.booking.create({
            data: {
                eventId: TEST_EVENT_1.id,
                userId: 2,
                status: "CONFIRMED",
            },
        });

        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: 2,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe("User already has a booking");
    });

    test("Create booking with user already on wait list", async () => {
        await prisma.booking.create({
            data: {
                eventId: TEST_EVENT_1.id,
                userId: 3,
                status: "PENDING",
            },
        });

        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: 3,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe("User is already on wait list");
    });

    test("Create booking with event sold out", async () => {
        const newEvent = await prisma.event.create({
            data: {
                name: "Test Event 2",
                description: "Test Event 2 Description",
                location: "Test Location 2",
                date: new Date(),
                ticketLimit: 3,
                price: 100,
            },
        });

        await prisma.booking.create({
            data: {
                eventId: newEvent.id,
                userId: 4,
                status: "CONFIRMED",
            },
        });

        await prisma.booking.create({
            data: {
                eventId: newEvent.id,
                userId: 5,
                status: "CONFIRMED",
            },
        });

        await prisma.booking.create({
            data: {
                eventId: newEvent.id,
                userId: 6,
                status: "CONFIRMED",
            },
        });

        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: newEvent.id,
                userId: 7,
            }),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.message).toBe("Event is sold out. User added to wait list");
        expect(body.wait).toBeDefined();

        const wait = body.wait;
        expect(wait.id).toBeDefined();
        expect(wait.userId).toBe(7);
        expect(wait.eventId).toBe(newEvent.id);
        expect(wait.status).toBe("PENDING");

        const booking = await prisma.booking.findUnique({
            where: {
                id: wait.id,
            },
        });
        expect(booking).toBeDefined();
        expect(booking?.userId).toBe(7);
        expect(booking?.eventId).toBe(newEvent.id);
        expect(booking?.status).toBe("PENDING");
    });

    test("Create booking with missing event ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: TEST_USER_1.id,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"eventId" is required');
    });

    test("Create booking with missing user ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"userId" is required');
    });

    test("Create booking with invalid event ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: "invalid",
                userId: TEST_USER_1.id,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"eventId" must be a number');
    });

    test("Create booking with invalid user ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: "invalid",
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"userId" must be a number');
    });

    test("Create booking with empty event ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: "",
                userId: TEST_USER_1.id,
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"eventId" must be a number');
    });

    test("Create booking with empty user ID", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: TEST_EVENT_1.id,
                userId: "",
            }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('"userId" must be a number');
    });

    test("Create booking with event ID as string of number", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: "3",
                userId: 8,
            }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.message).toBe("Ticket booked successfully");
    });

    test("Create booking with user ID as string of number", async () => {
        const response = await fetch(`${ENDPOINT}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId: 4,
                userId: "8",
            }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.message).toBe("Ticket booked successfully");
    });
});
