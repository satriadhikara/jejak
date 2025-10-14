import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

// import { formatValidationResult } from "@/validators/shared";

const reportGetParamsSchema = z.object({
  id: z.uuidv7(),
});

// const reportCreateBodySchema = z.object({});

const reportUpdateParamsSchema = z.object({
  id: z.uuidv7(),
});

// const reportUpdateBodySchema = z.object({});

const reportDeleteParamsSchema = z.object({
  id: z.uuidv7(),
});

export type ReportGetQuery = z.infer<typeof reportGetParamsSchema>;
export type ReportUpdateQuery = z.infer<typeof reportUpdateParamsSchema>;
export type ReportDeleteQuery = z.infer<typeof reportDeleteParamsSchema>;

export const reportGetQueryValidator = zValidator(
  "param",
  reportGetParamsSchema,
  // formatValidationResult,
);

export const reportUpdateParamsValidator = zValidator(
  "param",
  reportUpdateParamsSchema,
  // formatValidationResult,
);

export const reportDeleteParamsValidator = zValidator(
  "param",
  reportDeleteParamsSchema,
  // formatValidationResult,
);
