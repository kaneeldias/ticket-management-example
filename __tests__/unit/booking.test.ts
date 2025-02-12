import { MockPrismaClient, prisma } from "./mocks/prisma";
import { Booking } from "../../src/models/Booking";
import { CANCELLED_BOOKING_1, PENDING_BOOKING_1, TEST_BOOKING_1, TEST_EVENT_1, TEST_USER_1 } from "../test-data";
import { BookingNotFoundError } from "../../src/errors/BookingNotFoundError";
import { Event } from "../../src/models/Event";
import { User } from "../../src/models/User";
import { EventSoldOutError } from "../../src/errors/EventSoldOutError";
import { EventNotFoundError } from "../../src/errors/EventNotFoundError";
import { BookingAlreadyCancelledError } from "../../src/errors/BookingAlreadyCancelledError";
import { BookingAlreadyConfirmedError } from "../../src/errors/BookingAlreadyConfirmedError";
import { UserNotFoundError } from "../../src/errors/UserNotFoundError";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => prisma),
}));

describe("Booking model tests", () => {
    let mockPrisma: MockPrismaClient;

    beforeEach(() => {
        mockPrisma = prisma;
    });

    test("Get booking by ID which exists", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        const booking = await Booking.getById(1);
        expect(booking).toBeInstanceOf(Booking);
        expect(booking.getId()).toBe(1);
    });

    test("Get booking by ID which does not exist", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(null);
        await expect(Booking.getById(1)).rejects.toThrow(BookingNotFoundError);
        await expect(Booking.getById(1)).rejects.toThrow("Booking with ID 1 not found");
    });

    test("Create ticket", async () => {
        mockPrisma.booking.create.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);

        const event = await Event.getById(1);
        const user = await User.getById(1);
        const booking = await Booking.createTicket(event, user);
        expect(booking).toBeInstanceOf(Booking);
        expect(booking.getId()).toBe(1);
    });

    test("Create ticket but event is sold out", async () => {
        mockPrisma.booking.create.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.booking.count.mockResolvedValue(10);

        const event = await Event.getById(1);
        const user = await User.getById(1);
        await expect(Booking.createTicket(event, user)).rejects.toThrow(EventSoldOutError);
        await expect(Booking.createTicket(event, user)).rejects.toThrow("Event with ID 1 is sold out");
    });

    test("Add to wait list", async () => {
        mockPrisma.booking.findFirst.mockResolvedValue(null);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.booking.create.mockResolvedValue(TEST_BOOKING_1);

        const event = await Event.getById(1);
        const user = await User.getById(1);
        const booking = await Booking.addToWaitlist(event, user);
        expect(booking).toBeInstanceOf(Booking);
        expect(booking.getId()).toBe(1);
    });

    test("Get event associated with booking", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);

        const booking = await Booking.getById(1);
        const event = await booking.getEvent();
        expect(event).toBeInstanceOf(Event);
        expect(event.getId()).toBe(1);
    });

    test("Get event associated with booking which does not exist", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.event.findUnique.mockResolvedValue(null);

        const booking = await Booking.getById(1);
        await expect(booking.getEvent()).rejects.toThrow(EventNotFoundError);
    });

    test("Get user associated with booking", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);

        const booking = await Booking.getById(1);
        const user = await booking.getUser();
        expect(user).toBeInstanceOf(User);
        expect(user.getId()).toBe(1);
    });

    test("Get user associated with booking which does not exist", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.user.findUnique.mockResolvedValue(null);

        const booking = await Booking.getById(1);
        await expect(booking.getUser()).rejects.toThrow(UserNotFoundError);
        await expect(booking.getUser()).rejects.toThrow("User with ID 1 not found");
    });

    test("Cancel booking", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.booking.update.mockResolvedValue(CANCELLED_BOOKING_1);

        const booking = await Booking.getById(1);
        const cancelledBooking = await booking.cancel();
        expect(cancelledBooking).toBeInstanceOf(Booking);
        expect(cancelledBooking.getId()).toBe(1);
    });

    test("Cancel booking which is already cancelled", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(CANCELLED_BOOKING_1);

        const booking = await Booking.getById(1);
        await expect(booking.cancel()).rejects.toThrow(BookingAlreadyCancelledError);
        await expect(booking.cancel()).rejects.toThrow("Booking with ID 1 has already been cancelled");
    });

    test("Upgrade booking", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(PENDING_BOOKING_1);
        mockPrisma.booking.update.mockResolvedValue(TEST_BOOKING_1);

        const booking = await Booking.getById(1);
        const upgradedBooking = await booking.upgrade();
        expect(upgradedBooking).toBeInstanceOf(Booking);
        expect(upgradedBooking.getId()).toBe(1);
    });

    test("Upgrade booking which does not exist", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(null);
        await expect(Booking.getById(1)).rejects.toThrow(BookingNotFoundError);
        await expect(Booking.getById(1)).rejects.toThrow("Booking with ID 1 not found");
    });

    test("Upgrade booking but already confirmed", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(TEST_BOOKING_1);
        mockPrisma.booking.update.mockResolvedValue(CANCELLED_BOOKING_1);

        const booking = await Booking.getById(1);
        await expect(booking.upgrade()).rejects.toThrow(BookingAlreadyConfirmedError);
        await expect(booking.upgrade()).rejects.toThrow("Booking with ID 1 has already been confirmed");
    });

    test("Upgrade booking but already cancelled", async () => {
        mockPrisma.booking.findUnique.mockResolvedValue(CANCELLED_BOOKING_1);

        const booking = await Booking.getById(1);
        await expect(booking.upgrade()).rejects.toThrow(BookingAlreadyCancelledError);
        await expect(booking.upgrade()).rejects.toThrow("Booking with ID 1 has already been cancelled");
    });
});
