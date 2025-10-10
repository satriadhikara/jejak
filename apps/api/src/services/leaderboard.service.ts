import db from "@/db";
import { user } from "@/db/schema";
import { desc } from "drizzle-orm";

export type LeaderboardEntry = {
  id: string;
  name: string;
  image: string | null;
  points: number;
};

type LeaderboardServiceDependencies = {
  db: typeof db;
};

export type LeaderboardService = ReturnType<typeof createLeaderboardService>;

export const createLeaderboardService = ({
  db,
}: LeaderboardServiceDependencies) => {
  const getTopUsersByPoints = async (
    limit = 10,
  ): Promise<LeaderboardEntry[]> => {
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        points: user.points,
      })
      .from(user)
      .orderBy(desc(user.points), desc(user.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      ...row,
      points: row.points ?? 0,
    }));
  };

  return {
    getTopUsersByPoints,
  };
};

const leaderboardService = createLeaderboardService({ db });

export async function getTopUsersByPoints(
  limit = 10,
): Promise<LeaderboardEntry[]> {
  return leaderboardService.getTopUsersByPoints(limit);
}
