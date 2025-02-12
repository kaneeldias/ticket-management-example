import { PrismaClient } from "@prisma/client";
import { createTestUser, loadEnvVariables } from "./test-utils";
import request from "supertest";
import app from "../../src/app";

let prisma: PrismaClient;

describe("Testing auth", () => {
    beforeAll((done) => {
        jest.resetModules();
        loadEnvVariables(".env.test");
        prisma = new PrismaClient();
        done();
    });

    afterAll((done) => {
        prisma.$disconnect().finally(done());
    });

    test("Login with valid credentials", async () => {
        const userId = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const response = await request(app).post("/login").send({
            email: data?.email,
            password: data?.password,
        });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.token.length).toBeGreaterThan(50);
    });

    test("Login with invalid credentials", async () => {
        const userId = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                email: true,
            },
        });

        const response = await request(app).post("/login").send({
            email: data?.email,
            password: "wrong-password",
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Login with email that does not exist", async () => {
        const response = await request(app).post("/login").send({
            email: "does=not-exist@test.com",
            password: "password",
        });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("User with email does=not-exist@test.com not found");
    });

    test("Login with invalid email", async () => {
        const response = await request(app).post("/login").send({
            email: "invalid-email",
            password: "password",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"email" must be a valid email');
    });

    test("Login with missing email", async () => {
        const response = await request(app).post("/login").send({
            password: "password",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"email" is required');
    });

    test("Login with missing password", async () => {
        const response = await request(app).post("/login").send({
            email: "random@test.com",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"password" is required');
    });

    test("Login with empty body", async () => {
        const response = await request(app).post("/login").send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"email" is required');
    });

    test("Login with empty email", async () => {
        const response = await request(app).post("/login").send({
            email: "",
            password: "password",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"email" is not allowed to be empty');
    });

    test("Login with empty password", async () => {
        const response = await request(app).post("/login").send({
            email: "random@test.com",
            password: "",
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('"password" is not allowed to be empty');
    });

    test("Create new event without token", async () => {
        const response = await request(app).post("/initialize").send({
            name: "Test Event",
            description: "Test Description",
            location: "Test Location",
            date: "2022-01-01",
            ticketLimit: 100,
            price: 1000,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Create new event with valid token", async () => {
        const userId = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const loginResponse = await request(app).post("/login").send({
            email: data?.email,
            password: data?.password,
        });
        const token = loginResponse.body.token;

        const response = await request(app).post("/initialize").set("Authorization", token).send({
            name: "Test Event",
            description: "Test Description",
            location: "Test Location",
            date: "2022-01-01",
            ticketLimit: 100,
            price: 1000,
        });
        expect(response.status).toBe(201);
        expect(response.body.event.id).toBeDefined();
        expect(response.body.event.name).toBe("Test Event");
        expect(response.body.event.description).toBe("Test Description");
        expect(response.body.event.location).toBe("Test Location");
        expect(response.body.event.date).toBe("2022-01-01T00:00:00.000Z");
        expect(response.body.event.ticketLimit).toBe(100);
        expect(response.body.event.price).toBe(1000);
    });

    test("Create new event with invalid token", async () => {
        const response = await request(app).post("/initialize").set("Authorization", "invalid-token").send({
            name: "Test Event",
            description: "Test Description",
            location: "Test Location",
            date: "2022-01-01",
            ticketLimit: 100,
            price: 1000,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Create booking without token", async () => {
        const response = await request(app).post("/book").send({
            userId: 1,
            eventId: 1,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Create booking with valid token", async () => {
        const userId = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const loginResponse = await request(app).post("/login").send({
            email: data?.email,
            password: data?.password,
        });
        const token = loginResponse.body.token;

        const response = await request(app).post("/book").set("Authorization", token).send({
            userId: userId,
            eventId: 1,
        });
        expect(response.status).toBe(201);
        expect(response.body.booking.id).toBeDefined();
        expect(response.body.booking.userId).toBe(userId);
        expect(response.body.booking.eventId).toBe(1);
        expect(response.body.booking.status).toBe("CONFIRMED");
    });

    test("Create booking with valid token but wrong user", async () => {
        const userId1 = await createTestUser();
        const userId2 = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId1,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const loginResponse = await request(app).post("/login").send({
            email: data?.email,
            password: data?.password,
        });
        const token = loginResponse.body.token;

        const response = await request(app).post("/book").set("Authorization", token).send({
            userId: userId2,
            eventId: 1,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Create booking with invalid token", async () => {
        const response = await request(app).post("/book").set("Authorization", "invalid-token").send({
            userId: 1,
            eventId: 1,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Cancel booking without token", async () => {
        const response = await request(app).post("/cancel").send({
            bookingId: 1,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Cancel booking with valid token", async () => {
        const userId = await createTestUser();
        const data = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const loginResponse = await request(app).post("/login").send({
            email: data?.email,
            password: data?.password,
        });
        const token = loginResponse.body.token;

        const bookingResponse = await request(app).post("/book").set("Authorization", token).send({
            userId: userId,
            eventId: 1,
        });

        const response = await request(app).post("/cancel").set("Authorization", token).send({
            id: bookingResponse.body.booking.id,
        });

        expect(response.status).toBe(200);
        expect(response.body.booking.id).toBe(bookingResponse.body.booking.id);
        expect(response.body.booking.status).toBe("CANCELLED");
    });

    test("Cancel booking with valid token but wrong user", async () => {
        const userId1 = await createTestUser();
        const userId2 = await createTestUser();
        const data1 = await prisma.user.findUnique({
            where: {
                id: userId1,
            },
            select: {
                email: true,
                password: true,
            },
        });

        const loginResponse1 = await request(app).post("/login").send({
            email: data1?.email,
            password: data1?.password,
        });
        const token1 = loginResponse1.body.token;

        const data2 = await prisma.user.findUnique({
            where: {
                id: userId2,
            },
            select: {
                email: true,
                password: true,
            },
        });
        const loginResponse2 = await request(app).post("/login").send({
            email: data2?.email,
            password: data2?.password,
        });
        const token2 = loginResponse2.body.token;

        const bookingResponse = await request(app).post("/book").set("Authorization", token1).send({
            userId: userId1,
            eventId: 1,
        });

        const response = await request(app).post("/cancel").set("Authorization", token2).send({
            id: bookingResponse.body.booking.id,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });

    test("Cancel booking with invalid token", async () => {
        const response = await request(app).post("/cancel").set("Authorization", "invalid-token").send({
            id: 1,
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Access denied");
    });
});
