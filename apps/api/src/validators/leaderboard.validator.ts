import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const leaderboardTopQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const leaderboardTopQueryValidator = zValidator(
  "query",
  leaderboardTopQuerySchema,
);
