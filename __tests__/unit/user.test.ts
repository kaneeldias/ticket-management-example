import { MockPrismaClient, prisma } from "./mocks/prisma";
import { User } from "../../src/models/user/User";
import { Event } from "../../src/models/event/Event";
import { UserNotFoundError } from "../../src/errors/UserNotFoundError";
import { TEST_BOOKING_1, TEST_EVENT_1, TEST_USER_1 } from "../test-data";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => prisma),
}));

describe("User model tests", () => {
    let mockPrisma: MockPrismaClient;

    beforeEach(() => {
        mockPrisma = prisma;
    });

    test("Get user by id which exists", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);

        const user = await User.getById(1);
        expect(user).toBeInstanceOf(User);
        expect(user.getId()).toBe(1);
    });

    test("Get user by id which does not exist", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(User.getById(100)).rejects.toThrow(UserNotFoundError);
        await expect(User.getById(100)).rejects.toThrow("User with ID 100 not found");
    });

    test("User has ticket", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.findFirst.mockResolvedValue(TEST_BOOKING_1);

        const user = await User.getById(1);
        const event = await Event.getById(1);
        const hasTicket = await user.hasTicket(event);
        expect(hasTicket).toBe(true);
    });

    test("User does not have ticket", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.findFirst.mockResolvedValue(null);

        const user = await User.getById(1);
        const event = await Event.getById(1);
        const hasTicket = await user.hasTicket(event);
        expect(hasTicket).toBe(false);
    });

    test("User is on wait list", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.findFirst.mockResolvedValue(TEST_BOOKING_1);

        const user = await User.getById(1);
        const event = await Event.getById(1);
        const isOnWaitList = await user.isOnWaitList(event);
        expect(isOnWaitList).toBe(true);
    });

    test("User is not on wait list", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_1);
        mockPrisma.booking.findFirst.mockResolvedValue(null);

        const user = await User.getById(1);
        const event = await Event.getById(1);
        const isOnWaitList = await user.isOnWaitList(event);
        expect(isOnWaitList).toBe(false);
    });
});
