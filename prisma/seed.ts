import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const fs = require("fs");

async function main() {
    await populateUsers();
    await populateEvents();
    return prisma.$disconnect();
}

async function populateUsers() {
    const USERS = fs
        .readFileSync("seed_data/users.csv", "utf8")
        .split("\n")
        .map((line: string) => {
            const [email, password, firstName, lastName] = line.split(",");
            return { email, password, firstName, lastName };
        });

    USERS.shift();
    for (const user of USERS) {
        await prisma.user.upsert({
            where: {
                email: user.email,
            },
            update: {},
            create: {
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
}

async function populateEvents() {
    const EVENTS = fs
        .readFileSync("seed_data/events.csv", "utf8")
        .split("\n")
        .map((line: string) => {
            const [name, description, date, location, ticketLimit, price] = line.split(",");
            return { name, description, date, location, ticketLimit, price };
        });

    EVENTS.shift();
    for (const event of EVENTS) {
        await prisma.event.create({
            data: {
                name: event.name,
                description: event.description,
                date: new Date(event.date),
                location: event.location,
                ticketLimit: parseInt(event.ticketLimit),
                price: parseFloat(event.price),
            },
        });
    }
}

main();
