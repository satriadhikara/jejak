import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import {
  createValidationErrorPayload,
  extractValidationIssues,
} from "@/validators/shared";

export const errorHandler = async (err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    const response = err.getResponse();

    if (response.status === 400 || response.status === 422) {
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        try {
          const payload = await response.clone().json();

          const errorData = payload?.error ?? {};
          const issues = extractValidationIssues(errorData);

          if (errorData?.name === "ZodError" && issues) {
            return c.json(createValidationErrorPayload(issues), 422);
          }
        } catch (error) {
          console.warn("Failed to parse validation error response", error);
        }
      }

      const text = await response.clone().text();

      const mapped = mapValidationTextError(text);

      if (mapped) {
        return c.json(mapped, 422);
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
        return createValidationErrorPayload(issues);
      }
    }
  } catch {
    // ignore
  }

  return null;
};
