import { z } from "zod";

export const hireShopifyExpertLeadSchema = z.object({
  name: z.string().optional().nullable(),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  profileUrl: z
    .string()
    .url("Invalid profile URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  services: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  rating: z
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5")
    .optional()
    .nullable(),
  reviewsCount: z.number().int().min(0).optional().nullable(),
  socialLinks: z.any().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
}).refine(
  (data) =>
    (data.name && data.name.trim() !== "") ||
    (data.website && data.website.trim() !== "") ||
    (data.profileUrl && data.profileUrl.trim() !== ""),
  {
    message: "At least one of name, website, or profile URL is required",
    path: ["name"],
  }
);

export const hireShopifyExpertImportRowSchema = z.object({
  name: z.string().optional().nullable().default(null),
  website: z.string().optional().nullable().default(null),
  profileUrl: z.string().optional().nullable().default(null),
  email: z.string().optional().nullable().default(null),
  phone: z.string().optional().nullable().default(null),
  country: z.string().optional().nullable().default(null),
  city: z.string().optional().nullable().default(null),
  services: z.string().optional().nullable().default(null),
  specialization: z.string().optional().nullable().default(null),
  rating: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).max(5).optional().nullable()
  ),
  reviewsCount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).optional().nullable()
  ),
  socialLinks: z.any().optional().nullable().default(null),
  sourceUrl: z.string().optional().nullable().default(null),
  description: z.string().optional().nullable().default(null),
  category: z.string().optional().nullable().default(null),
  status: z.string().optional().nullable().default("active"),
}).refine(
  (data) =>
    (data.name && data.name.trim() !== "") ||
    (data.website && data.website.trim() !== "") ||
    (data.profileUrl && data.profileUrl.trim() !== ""),
  {
    message: "At least one of name, website, or profileUrl is required",
    path: ["name"],
  }
);

export type HireShopifyExpertLeadInput = z.infer<typeof hireShopifyExpertLeadSchema>;
