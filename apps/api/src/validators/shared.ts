import { HTTPException } from "hono/http-exception";
import type { Hook } from "@hono/zod-validator";

type ValidationIssue = {
  code: string;
  message: string;
  path: string[];
};

type ValidationErrorResponse = {
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

const extractIssues = (value: unknown): ValidationIssue[] | null => {
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
      return extractIssues(parsed);
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
      return extractIssues(record.message);
    }

    if ("error" in record) {
      const nested = extractIssues(record.error);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

export const formatValidationResult: Hook<any, any, any> = (result, c) => {
  if (!result.success && result.error) {
    const issues = extractIssues(result.error);

    const payload: ValidationErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        issues: issues ?? [],
      },
    };

    throw new HTTPException(422, {
      res: c.json(payload, 422),
    });
  }
};
