import db from "@/db";

export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  uptime: number;
  timestamp: string;
  services: {
    database: "up" | "down";
  };
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  let databaseStatus: "up" | "down" = "down";

  try {
    await db.execute("SELECT 1");
    databaseStatus = "up";
  } catch (error) {
    console.error("Database health check failed", error);
  }

  const status = databaseStatus === "up" ? "ok" : "degraded";

  return {
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: databaseStatus,
    },
  };
};
