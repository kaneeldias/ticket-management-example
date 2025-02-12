import { TEST_EVENT_1 } from "../test-data";
import { PrismaClient } from "@prisma/client";
import { loadEnvVariables } from "./test-utils";

let prisma: PrismaClient;
let ENDPOINT: string;

describe("Testing POST /initialize", () => {
    beforeAll(() => {
        jest.resetModules();
        loadEnvVariables(".env.test");
        prisma = new PrismaClient();
        ENDPOINT = `http://localhost:${process.env.PORT}`;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("Creating a new event", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(201);

        const responseData = await response.json();
        expect(responseData).toHaveProperty("message");
        expect(responseData).toHaveProperty("event");
        expect(responseData.message).toBe("Event created successfully");

        const data = responseData.event;
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("name");
        expect(data).toHaveProperty("description");
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("location");
        expect(data).toHaveProperty("ticketLimit");
        expect(data).toHaveProperty("price");

        expect(data.id).not.toBeNull();
        expect(Number.isInteger(data.id)).toBe(true);
        expect(data.name).toBe(TEST_EVENT_1.name);
        expect(data.description).toBe(TEST_EVENT_1.description);
        expect(data.date).toBe(TEST_EVENT_1.date.toISOString());
        expect(data.location).toBe(TEST_EVENT_1.location);
        expect(data.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(data.price).toBe(TEST_EVENT_1.price);

        const newEventId = data.id;
        const newEvent = await prisma.event.findUnique({
            where: {
                id: newEventId,
            },
        });

        expect(newEvent).not.toBeNull();
        expect(newEvent?.name).toBe(TEST_EVENT_1.name);
        expect(newEvent?.description).toBe(TEST_EVENT_1.description);
        expect(newEvent?.date).toStrictEqual(TEST_EVENT_1.date);
        expect(newEvent?.location).toBe(TEST_EVENT_1.location);
        expect(newEvent?.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(newEvent?.price).toBe(TEST_EVENT_1.price);
    });

    test("Creating a new event without name", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"name" is required');
    });

    test("Creating a new event without description", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"description" is required');
    });

    test("Creating a new event without date", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"date" is required');
    });

    test("Creating a new event without location", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"location" is required');
    });

    test("Creating a new event without ticketLimit", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"ticketLimit" is required');
    });

    test("Creating a new event without price", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"price" is required');
    });

    test("Creating a new event with empty name", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "",
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"name" is not allowed to be empty');
    });

    test("Creating a new event with empty description", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: "",
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"description" is not allowed to be empty');
    });

    test("Creating a new event with invalid date format 1", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: "abcd",
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"date" must be a valid date');
    });

    test("Creating a new event with invalid date format 2", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: "2023-13-32",
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"date" must be a valid date');
    });

    test("Creating a new event with empty location", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: "",
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"location" is not allowed to be empty');
    });

    test("Creating a new event with empty ticketLimit", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: "",
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"ticketLimit" must be a number');
    });

    test("Creating a new event with negative ticketLimit", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: -5,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"ticketLimit" must be greater than or equal to 1');
    });

    test("Creating a new event with ticketLimit as string", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: "120",
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(201);

        const responseData = await response.json();
        expect(responseData).toHaveProperty("message");
        expect(responseData).toHaveProperty("event");
        expect(responseData.message).toBe("Event created successfully");

        const data = responseData.event;
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("name");
        expect(data).toHaveProperty("description");
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("location");
        expect(data).toHaveProperty("ticketLimit");
        expect(data).toHaveProperty("price");

        expect(data.id).not.toBeNull();
        expect(Number.isInteger(data.id)).toBe(true);
        expect(data.name).toBe(TEST_EVENT_1.name);
        expect(data.description).toBe(TEST_EVENT_1.description);
        expect(data.date).toBe(TEST_EVENT_1.date.toISOString());
        expect(data.location).toBe(TEST_EVENT_1.location);
        expect(data.ticketLimit).toBe(120);
        expect(data.price).toBe(TEST_EVENT_1.price);

        const newEventId = data.id;
        const newEvent = await prisma.event.findUnique({
            where: {
                id: newEventId,
            },
        });

        expect(newEvent).not.toBeNull();
        expect(newEvent?.name).toBe(TEST_EVENT_1.name);
        expect(newEvent?.description).toBe(TEST_EVENT_1.description);
        expect(newEvent?.date).toStrictEqual(TEST_EVENT_1.date);
        expect(newEvent?.location).toBe(TEST_EVENT_1.location);
        expect(newEvent?.ticketLimit).toBe(120);
        expect(newEvent?.price).toBe(TEST_EVENT_1.price);
    });

    test("Creating a new event with ticket limit as invalid string", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: "test",
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"ticketLimit" must be a number');
    });

    test("Creating a new event with ticket limit as float", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: 15.5,
                price: TEST_EVENT_1.price,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"ticketLimit" must be an integer');
    });

    test("Creating a new event with empty price", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: "",
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"price" must be a number');
    });

    test("Creating a new event with negative price", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: -100,
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"price" must be a positive number');
    });

    test("Creating a new event with price as string", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: "100",
            }),
        });
        expect(response.status).toBe(201);

        const responseData = await response.json();
        expect(responseData).toHaveProperty("message");
        expect(responseData).toHaveProperty("event");
        expect(responseData.message).toBe("Event created successfully");

        const data = responseData.event;
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("name");
        expect(data).toHaveProperty("description");
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("location");
        expect(data).toHaveProperty("ticketLimit");
        expect(data).toHaveProperty("price");

        expect(data.id).not.toBeNull();
        expect(Number.isInteger(data.id)).toBe(true);
        expect(data.name).toBe(TEST_EVENT_1.name);
        expect(data.description).toBe(TEST_EVENT_1.description);
        expect(data.date).toBe(TEST_EVENT_1.date.toISOString());
        expect(data.location).toBe(TEST_EVENT_1.location);
        expect(data.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(data.price).toBe(100);

        const newEventId = data.id;
        const newEvent = await prisma.event.findUnique({
            where: {
                id: newEventId,
            },
        });

        expect(newEvent).not.toBeNull();
        expect(newEvent?.name).toBe(TEST_EVENT_1.name);
        expect(newEvent?.description).toBe(TEST_EVENT_1.description);
        expect(newEvent?.date).toStrictEqual(TEST_EVENT_1.date);
        expect(newEvent?.location).toBe(TEST_EVENT_1.location);
        expect(newEvent?.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(newEvent?.price).toBe(100);
    });

    test("Creating a new event with price as float", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: 100.5,
            }),
        });
        expect(response.status).toBe(201);

        const responseData = await response.json();
        expect(responseData).toHaveProperty("message");
        expect(responseData).toHaveProperty("event");
        expect(responseData.message).toBe("Event created successfully");

        const data = responseData.event;
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("name");
        expect(data).toHaveProperty("description");
        expect(data).toHaveProperty("date");
        expect(data).toHaveProperty("location");
        expect(data).toHaveProperty("ticketLimit");
        expect(data).toHaveProperty("price");

        expect(data.id).not.toBeNull();
        expect(Number.isInteger(data.id)).toBe(true);
        expect(data.name).toBe(TEST_EVENT_1.name);
        expect(data.description).toBe(TEST_EVENT_1.description);
        expect(data.date).toBe(TEST_EVENT_1.date.toISOString());
        expect(data.location).toBe(TEST_EVENT_1.location);
        expect(data.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(data.price).toBe(100.5);

        const newEventId = data.id;
        const newEvent = await prisma.event.findUnique({
            where: {
                id: newEventId,
            },
        });

        expect(newEvent).not.toBeNull();
        expect(newEvent?.name).toBe(TEST_EVENT_1.name);
        expect(newEvent?.description).toBe(TEST_EVENT_1.description);
        expect(newEvent?.date).toStrictEqual(TEST_EVENT_1.date);
        expect(newEvent?.location).toBe(TEST_EVENT_1.location);
        expect(newEvent?.ticketLimit).toBe(TEST_EVENT_1.ticketLimit);
        expect(newEvent?.price).toBe(100.5);
    });

    test("Creating a new event with invalid price as string", async () => {
        const response = await fetch(`${ENDPOINT}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: TEST_EVENT_1.name,
                description: TEST_EVENT_1.description,
                date: TEST_EVENT_1.date,
                location: TEST_EVENT_1.location,
                ticketLimit: TEST_EVENT_1.ticketLimit,
                price: "test",
            }),
        });
        expect(response.status).toBe(400);
        const responseData = await response.json();
        expect(responseData).toHaveProperty("error");
        expect(responseData.error).toBe('"price" must be a number');
    });
});
