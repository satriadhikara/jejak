import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

// import { formatValidationResult } from "@/validators/shared";

const storagePostBodySchema = z.object({
  fileName: z.string().min(1),
});

const storageReadBodySchema = z.object({
  key: z.string().min(1),
});

export type StorageReadBody = z.infer<typeof storageReadBodySchema>;

export type StorageUploadBody = z.infer<typeof storagePostBodySchema>;

export const storagePresignBodyValidator = zValidator(
  "json",
  storagePostBodySchema,
);

export const storageReadBodyValidator = zValidator(
  "query",
  storageReadBodySchema,
);
