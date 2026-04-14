"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("../config/env");
const index_1 = require("./index");
async function syncDatabase() {
    try {
        await index_1.sequelize.authenticate();
        console.log("✅ Database connected");
        await index_1.sequelize.sync({ alter: true });
        console.log("✅ Database synced successfully");
        await index_1.sequelize.close();
    }
    catch (err) {
        console.error("❌ Database sync failed", err);
        process.exit(1);
    }
}
syncDatabase();
