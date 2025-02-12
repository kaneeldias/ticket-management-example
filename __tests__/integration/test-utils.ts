import fs from "fs";
import path from "path";

export function loadEnvVariables(filePath: string) {
    const envConfig = fs.readFileSync(path.resolve(__dirname, filePath));
    const envConfigString = envConfig.toString();
    const envConfigLines = envConfigString.split("\n");
    envConfigLines.forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join("=").trim();
        }
    });
}
