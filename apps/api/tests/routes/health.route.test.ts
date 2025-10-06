import { describe, expect, it, mock } from "bun:test";

import { createHealthRouter } from "@/routes/health.route";
import type { HealthStatus } from "@/services/health.service";

describe("health routes", () => {
  it("returns health status", async () => {
    const healthStatus: HealthStatus = {
      status: "ok",
      uptime: 1,
      timestamp: "2024-01-01T00:00:00.000Z",
      services: {
        database: "up",
      },
    };

    const getHealthStatus = mock<() => Promise<HealthStatus>>(() =>
      Promise.resolve(healthStatus),
    );

    const router = createHealthRouter({ getHealthStatus });

    const request = new Request("http://localhost/");

    const response = await router.request(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      uptime: 1,
      timestamp: "2024-01-01T00:00:00.000Z",
      services: {
        database: "up",
      },
    });

    expect(getHealthStatus).toHaveBeenCalled();
  });
});
