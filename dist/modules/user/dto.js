"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLookupQuerySchema = exports.UserSearchQuerySchema = exports.UpdateProfileSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfileSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(1).max(150).optional(),
    mobile_number: zod_1.z.string().regex(/^\d{10,13}$/, "Mobile number must be 10-13 digits").optional(),
});
exports.UserSearchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, "Search query is required"),
    page: zod_1.z.string().default("1").transform(Number),
    limit: zod_1.z.string().default("20").transform(Number),
});
exports.UserLookupQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, "Search query is required"),
});
