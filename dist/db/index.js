"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.initDb = initDb;
exports.closeDb = closeDb;
require("reflect-metadata");
const sequelize_typescript_1 = require("sequelize-typescript");
const config_1 = require("../config");
const user_model_1 = require("./models/auth/user.model");
const session_model_1 = require("./models/auth/session.model");
const password_reset_token_model_1 = require("./models/auth/password-reset-token.model");
const animal_model_1 = require("./models/rescue/animal.model");
const rescue_model_1 = require("./models/rescue/rescue.model");
const rescue_image_model_1 = require("./models/rescue/rescue-image.model");
const rescue_person_model_1 = require("./models/rescue/rescue-person.model");
const to_address_model_1 = require("./models/rescue/to-address.model");
const log_export_model_1 = require("./models/logs/log-export.model");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    host: config_1.config.database.host,
    port: config_1.config.database.port || 5432,
    username: config_1.config.database.user,
    password: config_1.config.database.password,
    database: config_1.config.database.name,
    dialect: "postgres",
    pool: {
        max: 5, // keep LOW for pooler
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: config_1.config.database.ssl
        ? { ssl: { rejectUnauthorized: false } }
        : {},
    logging: false,
    models: [user_model_1.User, session_model_1.Session, password_reset_token_model_1.PasswordResetToken, animal_model_1.Animal, rescue_model_1.Rescue, rescue_image_model_1.RescueImage, rescue_person_model_1.RescuePerson, to_address_model_1.ToAddress, log_export_model_1.LogExport],
});
async function initDb() {
    try {
        await exports.sequelize.authenticate();
        console.log("Database connected successfully");
        await exports.sequelize.sync({ alter: true });
        console.log("Database synced with models");
    }
    catch (err) {
        console.error("Database connection failed", err);
        process.exit(1);
    }
}
async function closeDb() {
    await exports.sequelize.close();
    console.log("Database connection closed");
}
