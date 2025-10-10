import { describe, expect, it, beforeEach, mock } from "bun:test";

import { createHealthService } from "@/services/health.service";

describe("health service", () => {
  const now = "2024-05-01T00:00:00.000Z";

  let execute: ReturnType<typeof mock>;
  let error: ReturnType<typeof mock>;

  const getHealthService = () =>
    createHealthService({
      db: { execute } as unknown as Parameters<
        typeof createHealthService
      >[0]["db"],
      logger: { error } as unknown as Console,
      getTimestamp: () => now,
      getUptime: () => 42,
    });

  beforeEach(() => {
    execute = mock();
    error = mock();
  });

  it("returns ok when database is reachable", async () => {
    execute.mockResolvedValueOnce(undefined);

    const service = getHealthService();

    const result = await service.getHealthStatus();

    expect(result).toEqual({
      status: "ok",
      uptime: 42,
      timestamp: now,
      services: {
        database: "up",
      },
    });
  });

  it("returns degraded when database is down", async () => {
    execute.mockRejectedValueOnce(new Error("connection error"));

    const service = getHealthService();

    const result = await service.getHealthStatus();

    expect(result).toEqual({
      status: "degraded",
      uptime: 42,
      timestamp: now,
      services: {
        database: "down",
      },
    });
    expect(error).toHaveBeenCalledWith(
      "Database health check failed",
      expect.any(Error),
    );
  });
});
