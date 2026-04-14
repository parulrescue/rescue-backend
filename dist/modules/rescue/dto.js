"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescueIdParamSchema = exports.RescueListQuerySchema = exports.CreateRescueBodySchema = void 0;
const zod_1 = require("zod");
exports.CreateRescueBodySchema = zod_1.z.object({
    animal_type: zod_1.z.string().min(1, "Animal type is required").max(100),
    animal_description: zod_1.z.string().max(1000).optional().nullable(),
    info_provider_name: zod_1.z.string().min(1, "Info provider name is required").max(150),
    info_provider_number: zod_1.z.string().regex(/^\d{10,13}$/, "Info provider number must be 10-13 digits"),
    info_provider_user_id: zod_1.z.union([zod_1.z.string().transform(Number), zod_1.z.number()]).optional().nullable(),
    from_address: zod_1.z.string().min(1, "From address is required"),
    from_pincode: zod_1.z.string().regex(/^\d*$/, "Pincode must be digits only").max(6).optional().nullable(),
    from_area: zod_1.z.string().max(200).optional().nullable(),
    to_address: zod_1.z.string().min(1, "To address is required"),
    to_pincode: zod_1.z.string().regex(/^\d*$/, "Pincode must be digits only").max(6).optional().nullable(),
    to_area: zod_1.z.string().max(200).optional().nullable(),
    rescue_person_ids: zod_1.z.union([
        zod_1.z.string().transform((val) => JSON.parse(val)),
        zod_1.z.array(zod_1.z.number()),
    ]).optional(),
});
exports.RescueListQuerySchema = zod_1.z.object({
    page: zod_1.z.string().default("1").transform(Number),
    limit: zod_1.z.string().default("10").transform(Number),
    status: zod_1.z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
    animal_type: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    date_from: zod_1.z.string().optional(),
    date_to: zod_1.z.string().optional(),
});
exports.RescueIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, "Invalid rescue ID").transform(Number),
});
