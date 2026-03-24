import { z } from "zod";

export const CreateRescueBodySchema = z.object({
  animal_type: z.string().min(1, "Animal type is required").max(100),
  animal_description: z.string().max(1000).optional().nullable(),
  info_provider_name: z.string().min(1, "Info provider name is required").max(150),
  info_provider_number: z.string().regex(/^\d{10,13}$/, "Info provider number must be 10-13 digits"),
  info_provider_user_id: z.union([z.string().transform(Number), z.number()]).optional().nullable(),
  from_address: z.string().min(1, "From address is required"),
  from_pincode: z.string().regex(/^\d*$/, "Pincode must be digits only").max(6).optional().nullable(),
  from_area: z.string().max(200).optional().nullable(),
  to_address: z.string().min(1, "To address is required"),
  to_pincode: z.string().regex(/^\d*$/, "Pincode must be digits only").max(6).optional().nullable(),
  to_area: z.string().max(200).optional().nullable(),
  rescue_person_ids: z.union([
    z.string().transform((val) => JSON.parse(val) as number[]),
    z.array(z.number()),
  ]).optional(),
});

export const RescueListQuerySchema = z.object({
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  animal_type: z.string().optional(),
  search: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const RescueIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid rescue ID").transform(Number),
});
