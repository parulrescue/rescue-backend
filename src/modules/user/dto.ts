import { z } from "zod";

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(150).optional(),
  mobile_number: z.string().regex(/^\d{10,13}$/, "Mobile number must be 10-13 digits").optional(),
});

export const UserSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z.string().default("1").transform(Number),
  limit: z.string().default("20").transform(Number),
});

export const UserLookupQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
});
