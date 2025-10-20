import db from "@/db";
import { user, userPointsLog } from "@/db/schema";
import { and, desc, eq, gt, lt, or, sql, asc } from "drizzle-orm";

export type UserPoints = {
  points: number;
  rank: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  image: string | null;
  points: number;
};

type PointsServiceDependencies = {
  db: typeof db;
};

export type PointsService = ReturnType<typeof createPointsService>;

export const createPointsService = ({ db }: PointsServiceDependencies) => {
  const getUserPoints = async (userId: string): Promise<UserPoints> => {
    const [userData] = await db
      .select({
        points: user.points,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    const userPoints = userData.points ?? 0;

    // Calculate rank: count users with higher points OR same points but earlier creation
    const [rankData] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(
        or(
          gt(user.points, userPoints),
          and(
            eq(user.points, userPoints),
            lt(user.createdAt, userData.createdAt),
          ),
        ),
      );

    const rank = (rankData?.count ?? 0) + 1;

    return {
      points: userPoints,
      rank,
    };
  };

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
      .orderBy(desc(user.points), asc(user.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      ...row,
      points: row.points ?? 0,
    }));
  };

  const addPoints = async (
    userId: string,
    delta: number,
    reason?: string,
    referenceId?: string,
  ): Promise<UserPoints> => {
    // Update user points
    const [updatedUser] = await db
      .update(user)
      .set({
        points: sql`${user.points} + ${delta}`,
      })
      .where(eq(user.id, userId))
      .returning({
        points: user.points,
        createdAt: user.createdAt,
      });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Log the points transaction
    const logId = Bun.randomUUIDv7("base64url");
    await db.insert(userPointsLog).values({
      id: logId,
      userId,
      delta,
      reason,
      referenceId,
    });

    // Get updated rank
    const newPoints = (updatedUser.points ?? 0) + delta;
    const [rankData] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(
        or(
          gt(user.points, newPoints),
          and(
            eq(user.points, newPoints),
            lt(user.createdAt, updatedUser.createdAt),
          ),
        ),
      );

    const rank = (rankData?.count ?? 0) + 1;

    return {
      points: newPoints,
      rank,
    };
  };

  return {
    getTopUsersByPoints,
    getUserPoints,
    addPoints,
  };
};

const pointsService = createPointsService({ db });

export async function getTopUsersByPoints(
  limit = 10,
): Promise<LeaderboardEntry[]> {
  return pointsService.getTopUsersByPoints(limit);
}

export async function getUserPoints(userId: string): Promise<UserPoints> {
  return pointsService.getUserPoints(userId);
}

export async function addPoints(
  userId: string,
  delta: number,
  reason?: string,
  referenceId?: string,
): Promise<UserPoints> {
  return pointsService.addPoints(userId, delta, reason, referenceId);
}
