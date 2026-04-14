"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = exports.AppEnvSchema = void 0;
const zod_1 = require("zod");
exports.AppEnvSchema = zod_1.z.enum(["local", "uat", "prod"]);
exports.ConfigSchema = zod_1.z.object({
    app: zod_1.z.object({
        name: zod_1.z.string().min(1),
        env: exports.AppEnvSchema,
        port: zod_1.z.number().int().positive(),
        timezone: zod_1.z.string().min(1).default("Asia/Kolkata"), // Default: Indian Standard Time
    }),
    database: zod_1.z.object({
        host: zod_1.z.string(),
        port: zod_1.z.number(),
        user: zod_1.z.string(),
        password: zod_1.z.string(),
        name: zod_1.z.string(),
        ssl: zod_1.z.boolean(),
    }),
    logging: zod_1.z.object({
        captureErrors: zod_1.z.boolean(),
        captureSuccess: zod_1.z.boolean().default(false),
        logDbErrors: zod_1.z.boolean().default(false),
        dir: zod_1.z.string().min(1),
        exportDir: zod_1.z.string().optional(),
    }),
    security: zod_1.z.object({
        jwtSecret: zod_1.z.string().min(1),
        jwtExpiresIn: zod_1.z.string().default("48h"),
        bcryptSaltRounds: zod_1.z.number().int().min(4).max(20),
        aesSecretKey: zod_1.z.string().min(32),
    }),
    smtp: zod_1.z.object({
        host: zod_1.z.string().min(1),
        port: zod_1.z.number().int(),
        user: zod_1.z.string().min(1),
        pass: zod_1.z.string().min(1),
        from: zod_1.z.string().min(1),
    }),
    upload: zod_1.z.object({
        dir: zod_1.z.string().min(1),
    }),
    cors: zod_1.z.object({
        frontendUrl: zod_1.z.string().min(1),
    }),
});
