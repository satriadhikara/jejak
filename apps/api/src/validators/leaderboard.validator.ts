import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { formatValidationResult } from "@/validators/shared";

const leaderboardTopQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type LeaderboardTopQuery = z.infer<typeof leaderboardTopQuerySchema>;

export const leaderboardTopQueryValidator = zValidator(
  "query",
  leaderboardTopQuerySchema,
  formatValidationResult,
);
