import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler = async (err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);

  return c.json(
    {
      error: "Internal Server Error",
    },
    500,
  );
};
