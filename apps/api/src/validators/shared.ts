import { HTTPException } from "hono/http-exception";
import type { Hook } from "@hono/zod-validator";
import type { Env, ValidationTargets } from "hono";
import * as z from "zod";

export type ValidationIssue = {
  code: string;
  message: string;
  path: string[];
};

export type ValidationErrorPayload = {
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    issues: ValidationIssue[];
  };
};

const formatIssues = (value: unknown): ValidationIssue[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const mapped = value
    .map((issue) => {
      if (!issue || typeof issue !== "object") {
        return null;
      }

      const item = issue as Record<string, unknown>;

      const code = typeof item.code === "string" ? item.code : "UNKNOWN";
      const message =
        typeof item.message === "string" ? item.message : "Invalid value.";
      const path = Array.isArray(item.path)
        ? item.path.map((segment) => String(segment))
        : [];

      return { code, message, path } satisfies ValidationIssue;
    })
    .filter(Boolean) as ValidationIssue[];

  return mapped.length > 0 ? mapped : null;
};

export const extractValidationIssues = (
  value: unknown,
): ValidationIssue[] | null => {
  if (!value) {
    return null;
  }

  const directIssues = formatIssues(value);
  if (directIssues) {
    return directIssues;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return extractValidationIssues(parsed);
    } catch {
      return null;
    }
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if ("issues" in record) {
      const issues = formatIssues(record.issues);
      if (issues) {
        return issues;
      }
    }

    if ("message" in record && typeof record.message === "string") {
      return extractValidationIssues(record.message);
    }

    if ("error" in record) {
      const nested = extractValidationIssues(record.error);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const VALIDATION_MESSAGE = "Request validation failed.";

export const createValidationErrorPayload = (
  issues: ValidationIssue[] = [],
): ValidationErrorPayload => ({
  error: {
    code: "VALIDATION_ERROR",
    message: VALIDATION_MESSAGE,
    issues,
  },
});

export const formatValidationResult: Hook<
  unknown,
  Env,
  string,
  keyof ValidationTargets,
  {},
  z.ZodTypeAny
> = (result, c) => {
  if (!result.success && result.error) {
    const issues = extractValidationIssues(result.error) ?? [];

    throw new HTTPException(422, {
      res: c.json(createValidationErrorPayload(issues), 422),
    });
  }
};
