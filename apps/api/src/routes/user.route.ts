import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";

export const createUserRouter = () => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.get("/role", (c) => {
    const user = c.get("user")!;

    return c.json({
      role: user.role,
    });
  });

  return router;
};

export default createUserRouter();
