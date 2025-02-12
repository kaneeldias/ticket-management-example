import { execSync } from "child_process";

module.exports = async () => {
    console.log("Stopping Postgres container...");
    execSync("docker compose -f __tests__/integration/docker-compose.yml down --volumes");
};
