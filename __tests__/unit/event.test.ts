import { MockPrismaClient, prisma } from "./mocks/prisma";
import { PENDING_BOOKING_1, TEST_BOOKING_1, TEST_EVENT_1 } from "../test-data";
import { Event } from "../../src/models/Event";
import { EventNotFoundError } from "../../src/errors/EventNotFoundError";
import { CreateEventRequest } from "../../src/types/event";
import { ValidationError } from "joi";
import { Booking } from "../../src/models/Booking";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => prisma),
}));

const spyGetFirstOnWaitList = jest.spyOn(Booking, "getFirstOnWaitList");
const spyUpgrade = jest.spyOn(Booking.prototype, "upgrade");
const spyBumpWaitList = jest.spyOn(Event.prototype, "bumpWaitList");

describe("Event model tests", () => {
    let mockPrisma: MockPrismaClient;

    beforeEach(() => {
        mockPrisma = prisma;

        spyGetFirstOnWaitList.mockClear();
        spyUpgrade.mockClear();
        spyBumpWaitList.mockClear();
    });

    test("Get event by ID which exists", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        const event = await Event.getById(1);
        expect(event).toBeInstanceOf(Event);
        expect(event.getId()).toBe(1);
    });

    test("Get event by ID which does not exist", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(null);
        await expect(Event.getById(100)).rejects.toThrow(EventNotFoundError);
    });

    test("Create event with valid data", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        const event = await Event.create(newEvent);
        expect(event).toBeInstanceOf(Event);
        expect(event.getId()).toBe(1);
    });

    test("Create event with valid float price", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: 150.532,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        const event = await Event.create(newEvent);
        expect(event).toBeInstanceOf(Event);
        expect(event.getId()).toBe(1);
    });

    test("Create event with empty name", async () => {
        const newEvent: CreateEventRequest = {
            name: "",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"name" is not allowed to be empty');
    });

    test("Create event with invalid description", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"description" is not allowed to be empty');
    });

    test("Create event with invalid date", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date("invalid"),
            location: "Test Location",
            ticketLimit: 100,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"date" must be a valid date');
    });

    test("Create event with invalid location", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "",
            ticketLimit: 100,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"location" is not allowed to be empty');
    });

    test("Create event with invalid ticket limit", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 0,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"ticketLimit" must be greater than or equal to 1');
    });

    test("Create event with negative ticket limit", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: -3,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"ticketLimit" must be greater than or equal to 1');
    });

    test("Create event with negative ticket limit as float", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100.5,
            price: 1000,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"ticketLimit" must be an integer');
    });

    test("Create event with invalid price", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: 0,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"price" must be a positive number');
    });

    test("Create event with negative price as float", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: -3.52,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"price" must be a positive number');
    });

    test("Create event with negative price as integer", async () => {
        const newEvent: CreateEventRequest = {
            name: "Test Event",
            description: "Test Description",
            date: new Date(),
            location: "Test Location",
            ticketLimit: 100,
            price: -3,
        };
        mockPrisma.event.create.mockResolvedValue(TEST_EVENT_1);

        await expect(Event.create(newEvent)).rejects.toThrow(ValidationError);
        await expect(Event.create(newEvent)).rejects.toThrow('"price" must be a positive number');
    });

    test("Event is sold out", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(10);

        const event = await Event.getById(1);
        const isSoldOut = await event.isSoldOut();
        expect(isSoldOut).toBe(true);
    });

    test("Event is not sold out", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(9);

        const event = await Event.getById(1);
        const isSoldOut = await event.isSoldOut();
        expect(isSoldOut).toBe(false);
    });

    test("Bump wait list for sold out event", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.booking.count.mockResolvedValue(10);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).not.toHaveBeenCalled();
    });

    test("Bump wait list for event with empty wait list", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(5);
        mockPrisma.booking.findFirst.mockResolvedValue(null);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).toHaveBeenCalled();
        expect(spyUpgrade).not.toHaveBeenCalled();
        expect(spyBumpWaitList).toHaveBeenCalledTimes(1);
    });

    test("Bump wait list for event with 1 person in wait list", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(2);
        mockPrisma.booking.findFirst.mockResolvedValueOnce(PENDING_BOOKING_1);
        mockPrisma.booking.findFirst.mockResolvedValueOnce(null);
        mockPrisma.booking.update.mockResolvedValue(TEST_BOOKING_1);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).toHaveBeenCalledTimes(2);
        expect(spyUpgrade).toHaveBeenCalledTimes(1);
        expect(spyBumpWaitList).toHaveBeenCalledTimes(2);
    });

    test("Bump wait list for event with 5 people in wait list", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(2);
        for (let i = 0; i < 5; i++) {
            mockPrisma.booking.findFirst.mockResolvedValueOnce(PENDING_BOOKING_1);
        }
        mockPrisma.booking.findFirst.mockResolvedValueOnce(null);
        mockPrisma.booking.update.mockResolvedValue(TEST_BOOKING_1);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).toHaveBeenCalledTimes(6);
        expect(spyUpgrade).toHaveBeenCalledTimes(5);
        expect(spyBumpWaitList).toHaveBeenCalledTimes(6);
    });

    test("Bump wait list for event with 5 people in wait list, but event is sold out", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(10);
        for (let i = 0; i < 5; i++) {
            mockPrisma.booking.findFirst.mockResolvedValueOnce(TEST_BOOKING_1);
        }
        mockPrisma.booking.findFirst.mockResolvedValueOnce(null);
        mockPrisma.booking.update.mockResolvedValue(TEST_BOOKING_1);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).not.toHaveBeenCalled();
        expect(spyUpgrade).not.toHaveBeenCalled();
        expect(spyBumpWaitList).toHaveBeenCalledTimes(1);
    });

    test("Bump wait list for event with 5 people in wait list, there are only 2 openings", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValueOnce(8);
        mockPrisma.booking.count.mockResolvedValueOnce(9);
        mockPrisma.booking.count.mockResolvedValueOnce(10);
        mockPrisma.booking.findFirst.mockReset();
        for (let i = 0; i < 5; i++) {
            mockPrisma.booking.findFirst.mockResolvedValueOnce(PENDING_BOOKING_1);
        }
        mockPrisma.booking.findFirst.mockResolvedValue(null);
        mockPrisma.booking.update.mockResolvedValue(TEST_BOOKING_1);

        const event = await Event.getById(1);
        await event.bumpWaitList();
        expect(spyGetFirstOnWaitList).toHaveBeenCalledTimes(2);
        expect(spyUpgrade).toHaveBeenCalledTimes(2);
        expect(spyBumpWaitList).toHaveBeenCalledTimes(3);
    });

    test("Get tickets available count 1", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(9);
        const event = await Event.getById(1);
        const ticketsAvailable = await event.getTicketsAvailableCount();
        expect(ticketsAvailable).toBe(1);
    });

    test("Get tickets available count 2", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(5);
        const event = await Event.getById(1);
        const ticketsAvailable = await event.getTicketsAvailableCount();
        expect(ticketsAvailable).toBe(5);
    });

    test("Get tickets available count 2", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(0);
        const event = await Event.getById(1);
        const ticketsAvailable = await event.getTicketsAvailableCount();
        expect(ticketsAvailable).toBe(10);
    });

    test("Get tickets available count when sold out", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(10);
        const event = await Event.getById(1);
        const ticketsAvailable = await event.getTicketsAvailableCount();
        expect(ticketsAvailable).toBe(0);
    });

    test("Get wait list count 1", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(1);
        const event = await Event.getById(1);
        const waitListCount = await event.getWaitingListCount();
        expect(waitListCount).toBe(1);
    });

    test("Get wait list count 2", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(5);
        const event = await Event.getById(1);
        const waitListCount = await event.getWaitingListCount();
        expect(waitListCount).toBe(5);
    });

    test("Get wait list count when waiting list is empty", async () => {
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.count.mockResolvedValue(0);
        const event = await Event.getById(1);
        const waitListCount = await event.getWaitingListCount();
        expect(waitListCount).toBe(0);
    });
});
