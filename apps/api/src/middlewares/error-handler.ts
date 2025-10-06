import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

type ValidationIssue = {
  code: string;
  message: string;
  path: string[];
};

export const errorHandler = async (err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    const response = err.getResponse();

    if (response.status === 400) {
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        try {
          const payload = await response.clone().json();

          const errorData = payload?.error ?? {};
          const issues = extractValidationIssues(errorData);

          if (errorData?.name === "ZodError" && issues) {
            return c.json(
              {
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Request validation failed.",
                  issues,
                },
              },
              400,
            );
          }
        } catch (error) {
          console.warn("Failed to parse validation error response", error);
        }
      }

      const text = await response.clone().text();

      const mapped = mapValidationTextError(text);

      if (mapped) {
        return c.json(
          {
            error: mapped,
          },
          400,
        );
      }
    }

    return response;
  }

  console.error(err);

  return c.json(
    {
      error: "Internal Server Error",
    },
    500,
  );
};

const normalizeIssues = (value: unknown): ValidationIssue[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((issue) => {
      if (!issue || typeof issue !== "object") {
        return null;
      }

      const record = issue as Record<string, unknown>;

      const path = Array.isArray(record.path)
        ? record.path.map((segment) => String(segment))
        : [];

      const message =
        typeof record.message === "string" ? record.message : "Invalid value.";

      const code = typeof record.code === "string" ? record.code : "UNKNOWN";

      return { code, message, path } satisfies ValidationIssue;
    })
    .filter(Boolean) as ValidationIssue[];

  return normalized.length > 0 ? normalized : [];
};

const extractValidationIssues = (value: unknown): ValidationIssue[] | null => {
  const normalized = normalizeIssues(value);
  if (normalized) {
    return normalized;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if ("issues" in record) {
      const issues = normalizeIssues(record.issues);
      if (issues) {
        return issues;
      }
    }

    if ("error" in record) {
      const nested = extractValidationIssues(record.error);
      if (nested) {
        return nested;
      }
    }

    if (typeof record.message === "string") {
      return extractValidationIssues(record.message);
    }

    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed);
      return extractValidationIssues(parsed);
    } catch {
      return null;
    }
  }

  return null;
};

const mapValidationTextError = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    const record =
      parsed && typeof parsed === "object"
        ? ((parsed as Record<string, unknown>).error ?? parsed)
        : null;

    if (
      record &&
      typeof record === "object" &&
      (record as Record<string, unknown>).name === "ZodError"
    ) {
      const issues = extractValidationIssues(record);

      if (issues) {
        return {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          issues,
        } satisfies ValidationIssueResponse;
      }
    }
  } catch {
    // ignore
  }

  return null;
};

type ValidationIssueResponse = {
  code: "VALIDATION_ERROR";
  message: string;
  issues: ValidationIssue[];
};
