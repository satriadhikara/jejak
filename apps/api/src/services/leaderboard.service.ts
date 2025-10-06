import db from "@/db";
import { user } from "@/db/schema";
import { desc } from "drizzle-orm";

export type LeaderboardEntry = {
  id: string;
  name: string;
  image: string | null;
  points: number;
};

export async function getTopUsersByPoints(
  limit = 10,
): Promise<LeaderboardEntry[]> {
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
}
