import { Hono } from "hono";

import { getTopUsersByPoints } from "@/services/leaderboard.service";

const leaderboardRoutes = new Hono();

leaderboardRoutes.get("/top", async (c) => {
  const limitParam = c.req.query("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 10;
  const limit = Number.isNaN(parsedLimit)
    ? 10
    : Math.min(Math.max(parsedLimit, 1), 100);

  const leaderboard = await getTopUsersByPoints(limit);

  return c.json({ data: leaderboard });
});

export default leaderboardRoutes;
