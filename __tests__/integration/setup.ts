import { execSync } from "child_process";

module.exports = async () => {
    console.log("Starting Postgres container...");
    execSync("npm run start-db");
    execSync("npm run init-db");
};
