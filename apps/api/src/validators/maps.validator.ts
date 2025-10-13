import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

import { formatValidationResult } from "@/validators/shared";

const coordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const locationSchema = coordinateSchema.extend({
  label: z.string().min(1),
});

const mapsAnalyzeBodySchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  route: z.object({
    coordinates: z.array(coordinateSchema).min(2),
    distance: z.string(),
    duration: z.string(),
  }),
});

export type MapsAnalyzeBody = z.infer<typeof mapsAnalyzeBodySchema>;

export const mapsAnalyzeBodyValidator = zValidator(
  "json",
  mapsAnalyzeBodySchema,
);
