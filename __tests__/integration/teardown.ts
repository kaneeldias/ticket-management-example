import { execSync } from "child_process";

module.exports = async () => {
    console.log("Stopping Postgres container...");
    execSync("npm run stop-db");
};
