"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterLogsQuerySchema = exports.GetAvailableDatesQuerySchema = exports.GetExportHistoryQuerySchema = void 0;
const zod_1 = require("zod");
exports.GetExportHistoryQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    environment: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    logType: zod_1.z.enum(["INFO", "ERROR", "ALL"]).optional(),
});
exports.GetAvailableDatesQuerySchema = zod_1.z.object({
    environment: zod_1.z.string().optional(),
});
exports.FilterLogsQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    level: zod_1.z.enum(["INFO", "ERROR"]).optional(),
});
