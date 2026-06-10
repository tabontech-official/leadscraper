import { z } from "zod";

export const startJobSchema = z.object({
  name: z.string().max(200).optional(),
  rows: z.array(
    z.object({
      zip_code: z.string().min(1).max(20),
      category: z.string().min(1).max(500),
      state: z.string().min(1).max(100),
    })
  ),
  resultsPerRow: z.number().int().min(1).max(50),
  searchProvider: z.enum(["serpapi", "google_places"]),
  runTechImmediately: z.boolean(),
});

export const leadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  domain: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  zipCode: z.string().optional(),
  primaryTech: z.string().optional(),
  hasEmail: z.coerce.boolean().optional(),
  hasPhone: z.coerce.boolean().optional(),
  hasWebsite: z.coerce.boolean().optional(),
  confidenceMin: z.coerce.number().int().min(0).max(100).optional(),
  jobId: z.string().optional(),
  ids: z.string().optional(),
});

export const techDetectSchema = z.object({
  leadIds: z.array(z.string().min(1)).min(1).max(50),
});
