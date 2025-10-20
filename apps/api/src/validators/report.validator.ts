import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

// import { formatValidationResult } from "@/validators/shared";

const reportGetQuerySchema = z.object({
  draft: z
    .preprocess((value) => {
      if (typeof value === "string") {
        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;
      }

      return value;
    }, z.boolean())
    .optional()
    .default(false),
});

const reportGetParamsSchema = z.object({
  id: z.string(),
});

const reportCreateBodySchema = z.object({
  title: z.string().min(1),
  locationName: z.string().min(1),
  locationGeo: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  damageCategory: z.enum(["berat", "sedang", "ringan"]),
  impactOfDamage: z.string().optional(),
  description: z.string().optional(),
  photosUrls: z.array(
    z.object({
      key: z.string().min(1),
    }),
  ),
  status: z.enum([
    "draft",
    "diperiksa",
    "dikonfirmasi",
    "dalam_penanganan",
    "selesai",
    "ditolak",
  ]),
  statusHistory: z.array(
    z.object({
      status: z.enum([
        "draft",
        "diperiksa",
        "dikonfirmasi",
        "dalam_penanganan",
        "selesai",
        "ditolak",
      ]),
      timestamp: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
});

const reportUpdateParamsSchema = z.object({
  id: z.string(),
});

const reportUpdateBodySchema = z.object({
  title: z.string().min(1).optional(),
  locationName: z.string().min(1).optional(),
  locationGeo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  damageCategory: z.enum(["berat", "sedang", "ringan"]).optional(),
  impactOfDamage: z.string().optional(),
  description: z.string().optional(),
  photosUrls: z
    .array(
      z.object({
        key: z.string().min(1),
      }),
    )
    .optional(),
  status: z
    .enum([
      "draft",
      "diperiksa",
      "dikonfirmasi",
      "dalam_penanganan",
      "selesai",
      "ditolak",
    ])
    .optional(),
  statusHistory: z
    .array(
      z.object({
        status: z.enum([
          "draft",
          "diperiksa",
          "dikonfirmasi",
          "dalam_penanganan",
          "selesai",
          "ditolak",
        ]),
        timestamp: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .optional(),
});

const reportDeleteParamsSchema = z.object({
  id: z.uuidv7(),
});

const reportNearbyQuerySchema = z.object({
  minLat: z.coerce.number().min(-90).max(90),
  maxLat: z.coerce.number().min(-90).max(90),
  minLng: z.coerce.number().min(-180).max(180),
  maxLng: z.coerce.number().min(-180).max(180),
});

export type ReportGetQuery = z.infer<typeof reportGetQuerySchema>;
export type ReportGetParams = z.infer<typeof reportGetParamsSchema>;
export type ReportUpdateParams = z.infer<typeof reportUpdateParamsSchema>;
export type ReportUpdateBody = z.infer<typeof reportUpdateBodySchema>;
export type ReportDeleteQuery = z.infer<typeof reportDeleteParamsSchema>;
export type ReportCreateBody = z.infer<typeof reportCreateBodySchema>;
export type ReportNearbyQuery = z.infer<typeof reportNearbyQuerySchema>;

export const reportGetQueryValidator = zValidator(
  "query",
  reportGetQuerySchema,
  // formatValidationResult,
);

export const reportGetParamsValidator = zValidator(
  "param",
  reportGetParamsSchema,
  // formatValidationResult,
);

export const reportCreateBodyValidator = zValidator(
  "json",
  reportCreateBodySchema,
  // formatValidationResult,
);

export const reportUpdateParamsValidator = zValidator(
  "param",
  reportUpdateParamsSchema,
  // formatValidationResult,
);

export const reportUpdateBodyValidator = zValidator(
  "json",
  reportUpdateBodySchema,
  // formatValidationResult,
);

export const reportDeleteParamsValidator = zValidator(
  "param",
  reportDeleteParamsSchema,
  // formatValidationResult,
);

export const reportNearbyQueryValidator = zValidator(
  "query",
  reportNearbyQuerySchema,
  // formatValidationResult,
);
