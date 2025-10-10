import { Hono } from "hono";

import {
  pointsTopQueryValidator,
  type PointsTopQuery,
} from "@/validators/points.validator";
import { getTopUsersByPoints } from "@/services/points.service";

type PointsRouteDependencies = {
  getTopUsersByPoints: typeof getTopUsersByPoints;
};

const defaultDependencies: PointsRouteDependencies = {
  getTopUsersByPoints,
};

export const createPointsRouter = (
  deps: PointsRouteDependencies = defaultDependencies,
) => {
  const router = new Hono();

  router.get("/top", pointsTopQueryValidator, async (c) => {
    const { limit } = c.req.valid("query") as PointsTopQuery;

    const leaderboard = await deps.getTopUsersByPoints(limit);

    return c.json({ data: leaderboard });
  });

  return router;
};

export default createPointsRouter();
