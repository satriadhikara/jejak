import db from "@/db";

export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  uptime: number;
  timestamp: string;
  services: {
    database: "up" | "down";
  };
};

type HealthServiceDependencies = {
  db: Pick<typeof db, "execute">;
  logger?: Pick<typeof console, "error">;
  getUptime?: () => number;
  getTimestamp?: () => string;
};

export type HealthService = ReturnType<typeof createHealthService>;

export const createHealthService = ({
  db,
  logger = console,
  getUptime = process.uptime,
  getTimestamp = () => new Date().toISOString(),
}: HealthServiceDependencies) => {
  const getHealthStatus = async (): Promise<HealthStatus> => {
    let databaseStatus: "up" | "down" = "down";

    try {
      await db.execute("SELECT 1");
      databaseStatus = "up";
    } catch (error) {
      logger.error?.("Database health check failed", error);
    }

    const status = databaseStatus === "up" ? "ok" : "degraded";

    return {
      status,
      uptime: getUptime(),
      timestamp: getTimestamp(),
      services: {
        database: databaseStatus,
      },
    };
  };

  return {
    getHealthStatus,
  };
};

const healthService = createHealthService({ db });

export const getHealthStatus = async (): Promise<HealthStatus> => {
  return healthService.getHealthStatus();
};
