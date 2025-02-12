import { BookingStatus } from "@prisma/client";

export const TEST_USER_1 = {
    id: 1,
    email: "test@example.com",
    password: "password",
    firstName: "Test",
    lastName: "User",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

export const TEST_EVENT_1 = {
    id: 1,
    name: "Test Event",
    description: "Test Description",
    date: new Date(),
    location: "Test Location",
    ticketLimit: 10,
    price: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

export const TEST_BOOKING_1 = {
    id: 1,
    userId: 1,
    eventId: 1,
    status: "CONFIRMED" as BookingStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

export const CANCELLED_BOOKING_1 = {
    id: 1,
    userId: 1,
    eventId: 1,
    status: "CANCELLED" as BookingStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

export const PENDING_BOOKING_1 = {
    id: 1,
    userId: 1,
    eventId: 1,
    status: "PENDING" as BookingStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};
