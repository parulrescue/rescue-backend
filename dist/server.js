"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const app_1 = require("./app");
async function startServer() {
    try {
        const app = await (0, app_1.buildApp)();
        await app.listen({ port: config_1.config.app.port, host: "0.0.0.0" });
        console.log(`🚀 Server running at port ${config_1.config.app.port}`);
    }
    catch (err) {
        console.log("❌ Failed to start server", err);
        process.exit(1);
    }
}
startServer();
