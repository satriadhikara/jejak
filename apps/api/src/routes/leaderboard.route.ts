import { Hono } from "hono";

import { leaderboardTopQueryValidator } from "@/validators/leaderboard.validator";
import { getTopUsersByPoints } from "@/services/leaderboard.service";

const leaderboardRoutes = new Hono();

leaderboardRoutes.get("/top", leaderboardTopQueryValidator, async (c) => {
  const { limit } = c.req.valid("query");

  const leaderboard = await getTopUsersByPoints(limit);

  return c.json({ data: leaderboard });
});

export default leaderboardRoutes;
