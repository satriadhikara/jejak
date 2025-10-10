import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { formatValidationResult } from "@/validators/shared";

const pointsTopQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PointsTopQuery = z.infer<typeof pointsTopQuerySchema>;

export const pointsTopQueryValidator = zValidator(
  "query",
  pointsTopQuerySchema,
  formatValidationResult,
);
