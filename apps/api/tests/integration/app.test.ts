import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import app from "@/app";

let server: ReturnType<typeof Bun.serve>;

describe("app integration", () => {
  beforeAll(() => {
    server = Bun.serve({
      port: 0,
      fetch: app.fetch,
    });
  });

  afterAll(() => {
    server.stop();
  });

  it("responds to health check", async () => {
    const url = new URL("/api/health", server.url);

    const response = await fetch(url);

    expect(response.status).toBe(200);
  });
});
