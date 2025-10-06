import { Hono } from "hono";

import { leaderboardTopQueryValidator } from "@/validators/leaderboard.validator";
import { getTopUsersByPoints } from "@/services/leaderboard.service";

type LeaderboardRouteDependencies = {
  getTopUsersByPoints: typeof getTopUsersByPoints;
};

const defaultDependencies: LeaderboardRouteDependencies = {
  getTopUsersByPoints,
};

export const createLeaderboardRouter = (
  deps: LeaderboardRouteDependencies = defaultDependencies,
) => {
  const router = new Hono();

  router.get("/top", leaderboardTopQueryValidator, async (c) => {
    const { limit } = c.req.valid("query");

    const leaderboard = await deps.getTopUsersByPoints(limit);

    return c.json({ data: leaderboard });
  });

  return router;
};

export default createLeaderboardRouter();
