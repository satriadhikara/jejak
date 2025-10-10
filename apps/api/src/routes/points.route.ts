import {
  pointsTopQueryValidator,
  type PointsTopQuery,
} from "@/validators/points.validator";
import { getTopUsersByPoints, getUserPoints } from "@/services/points.service";
import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";

type PointsRouteDependencies = {
  getTopUsersByPoints: typeof getTopUsersByPoints;
  getUserPoints: typeof getUserPoints;
};

const defaultDependencies: PointsRouteDependencies = {
  getTopUsersByPoints,
  getUserPoints,
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

  return router;
};

export default createPointsRouter();
