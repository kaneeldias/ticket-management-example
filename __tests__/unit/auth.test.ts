import { MockPrismaClient, prisma } from "./mocks/prisma";
import { TEST_USER_1 } from "../test-data";
import { generateToken, validatePassword } from "../../src/middleware/auth";
import { UserNotFoundError } from "../../src/errors/UserNotFoundError";
import jwt from "jsonwebtoken";

jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn().mockImplementation(() => prisma),
}));

describe("User model tests", () => {
    let mockPrisma: MockPrismaClient;

    beforeEach(() => {
        mockPrisma = prisma;
    });

    test("Verify valid password", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        await expect(validatePassword(TEST_USER_1.email, TEST_USER_1.password)).resolves.toBe(true);
    });

    test("Verify invalid password", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        await expect(validatePassword(TEST_USER_1.email, "invalid-password")).resolves.toBe(false);
    });

    test("Verify password for non-existent user", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        await expect(validatePassword(TEST_USER_1.email, TEST_USER_1.password)).rejects.toThrow(UserNotFoundError);
        await expect(validatePassword(TEST_USER_1.email, TEST_USER_1.password)).rejects.toThrow(
            `User with email ${TEST_USER_1.email} not found`,
        );
    });

    test("Verify generate token for valid user", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(TEST_USER_1);
        const token = await generateToken(TEST_USER_1.email);
        expect(token).toBeDefined();

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        const userId = (decoded as any).id;
        const email = (decoded as any).email;
        expect(userId).toBe(TEST_USER_1.id);
        expect(email).toBe(TEST_USER_1.email);
    });

    test("Verify generate token for non-existent user", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        await expect(generateToken("invalid@email.com")).rejects.toThrow(UserNotFoundError);
        await expect(generateToken("invalid@email.com")).rejects.toThrow(`User with email invalid@email.com not found`);
    });
});
