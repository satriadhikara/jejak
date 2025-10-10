import { Hono } from "hono";
import type { AuthContextVariables } from "@/lib/auth";

export const createRouter = () => {
  return new Hono<{ Variables: AuthContextVariables }>();
};
