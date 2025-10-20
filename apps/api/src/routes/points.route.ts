import {
  pointsTopQueryValidator,
  type PointsTopQuery,
} from "@/validators/points.validator";
import {
  getTopUsersByPoints,
  getUserPoints,
  addPoints,
} from "@/services/points.service";
import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";

type PointsRouteDependencies = {
  getTopUsersByPoints: typeof getTopUsersByPoints;
  getUserPoints: typeof getUserPoints;
  addPoints: typeof addPoints;
};

const defaultDependencies: PointsRouteDependencies = {
  getTopUsersByPoints,
  getUserPoints,
  addPoints,
};

export const createPointsRouter = (
  deps: PointsRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.get("/top", pointsTopQueryValidator, async (c) => {
    const { limit } = c.req.valid("query") as PointsTopQuery;

    const leaderboard = await deps.getTopUsersByPoints(limit);

    return c.json({ data: leaderboard });
  });

  router.get("/user", async (c) => {
    const user = c.get("user")!;

    const points = await deps.getUserPoints(user.id);

    return c.json({ data: points });
  });

  router.post("/add", async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json<{
      delta: number;
      reason?: string;
      referenceId?: string;
    }>();

    const { delta, reason, referenceId } = body;

    if (!delta || typeof delta !== "number" || delta <= 0) {
      return c.json(
        { error: "Invalid delta. Must be a positive number." },
        400,
      );
    }

    const points = await deps.addPoints(user.id, delta, reason, referenceId);

    return c.json({ data: points });
  });

  return router;
};

export default createPointsRouter();
