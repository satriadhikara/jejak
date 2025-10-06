import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const leaderboardTopQuerySchema = z
  .object({
    limit: z
      .string()
      .transform((value) => Number.parseInt(value, 10))
      .refine((value) => !Number.isNaN(value), {
        message: "limit must be a number",
      })
      .refine((value) => value > 0, {
        message: "limit must be greater than 0",
      })
      .refine((value) => value <= 100, {
        message: "limit must be less than or equal to 100",
      })
      .optional()
      .default(10),
  })
  .transform((query) => ({
    limit: query.limit,
  }));

export const leaderboardTopQueryValidator = zValidator(
  "query",
  leaderboardTopQuerySchema,
);
