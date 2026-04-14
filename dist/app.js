"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
// plugins
const requestId_plugin_1 = require("./plugins/requestId.plugin");
const error_plugin_1 = require("./plugins/error.plugin");
const db_plugin_1 = require("./plugins/db.plugin");
const request_logger_1 = require("./plugins/request-logger");
const client_info_plugin_1 = require("./plugins/client-info.plugin");
// fastify plugins
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const static_1 = __importDefault(require("@fastify/static"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
// modules
const routes_1 = require("./modules/auth/routes");
const routes_2 = require("./modules/user/routes");
const routes_3 = require("./modules/rescue/routes");
const routes_4 = require("./modules/animal/routes");
const routes_5 = require("./modules/to-address/routes");
const routes_6 = require("./modules/log-export/routes");
// logger + env
const pino_1 = require("./logger/pino");
const environments_1 = __importDefault(require("./config/environments"));
// db
const db_1 = require("./db");
async function buildApp() {
    const { logger, files } = (0, pino_1.createFileLogger)({
        baseDir: environments_1.default?.logging?.dir,
        level: "info",
    });
    await (0, db_1.initDb)();
    const app = (0, fastify_1.default)({
        loggerInstance: logger,
        trustProxy: true,
        genReqId: () => (0, crypto_1.randomUUID)(),
        disableRequestLogging: true,
    });
    // CORS — whitelist only frontend URL
    app.register(cors_1.default, {
        origin: ['*'],
        credentials: true,
    });
    // Helmet — security headers
    app.register(helmet_1.default, {
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    });
    // Multipart — file uploads
    app.register(multipart_1.default, {
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB (for video uploads)
            files: 10,
        },
    });
    // Rate limiting — 100 req/min per IP
    app.register(rate_limit_1.default, {
        max: 100,
        timeWindow: "1 minute",
    });
    // Static file serving for uploads (legacy)
    const uploadDir = path_1.default.resolve(config_1.config.upload.dir);
    if (!fs_1.default.existsSync(uploadDir))
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    app.register(static_1.default, {
        root: uploadDir,
        prefix: "/uploads/",
        decorateReply: false,
    });
    // Static file serving for public/ directory (profile_pic, etc.)
    const publicDir = path_1.default.join(process.cwd(), "public");
    if (!fs_1.default.existsSync(publicDir))
        fs_1.default.mkdirSync(publicDir, { recursive: true });
    app.register(static_1.default, {
        root: publicDir,
        prefix: "/public/",
        decorateReply: false,
    });
    // Logging + client info
    app.register(client_info_plugin_1.clientInfoPlugin);
    app.register(request_logger_1.requestLoggerPlugin);
    // Graceful shutdown
    const shutdown = async () => {
        try {
            await app.close();
        }
        finally {
            try {
                files.close();
            }
            catch { }
            try {
                await (0, db_1.closeDb)();
            }
            catch { }
        }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    // Core plugins
    app.register(requestId_plugin_1.requestIdPlugin);
    app.register(db_plugin_1.dbPlugin);
    app.register(error_plugin_1.errorPlugin);
    // Health check
    app.get("/", async (_request, reply) => {
        return reply.send({ status: "ok", message: "Animal Rescue API is running" });
    });
    // API routes
    app.register(routes_1.authRoutes, { prefix: "/api/v1/auth" });
    app.register(routes_2.userRoutes, { prefix: "/api/v1/users" });
    app.register(routes_3.rescueRoutes, { prefix: "/api/v1/rescues" });
    app.register(routes_4.animalRoutes, { prefix: "/api/v1/animals" });
    app.register(routes_5.toAddressRoutes, { prefix: "/api/v1/to-addresses" });
    app.register(routes_6.logExportRoutes, { prefix: "/api/logs" });
    // Keep-alive ping every 15 seconds to prevent Render cold starts
    setInterval(() => {
        (async () => {
            try {
                const res = await fetch("https://rescue-backend-b4uz.onrender.com/");
                console.log(res.status, 'Ping');
            }
            catch (error) {
                console.log(error);
            }
        })();
    }, 15000);
    return app;
}
