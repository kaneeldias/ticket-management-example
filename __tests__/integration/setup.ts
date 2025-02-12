import { execSync } from "child_process";
import { loadEnvVariables } from "./test-utils";
import { exec } from "node:child_process";

module.exports = async () => {
    loadEnvVariables(".env.test");

    console.log("Starting Postgres container...");
    execSync("docker compose -f __tests__/integration/docker-compose.yml up -d");
    console.log("Started Postgres container");

    console.log("Generate prisma client...");
    try {
        execSync("npx prisma generate");
        console.log("Prisma client generated");
    } catch (error) {
        console.log("Prisma client already generated");
    }

    console.log("Initializing database...");
    execSync("npx prisma db push --schema ./prisma/schema.prisma");
    execSync("npx prisma db seed  --schema ./prisma/schema.prisma");
    console.log("Database initialized");

    console.log("Starting server...");
    exec("ts-node src/server.ts");
    console.log("Server started");

    // sleep for 5 seconds to allow server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
};
