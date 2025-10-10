import { describe, expect, it, mock } from "bun:test";

import { createPointsRouter } from "@/routes/points.route";

describe("points routes", () => {
  const request = (url: string) =>
    new Request(url, {
      headers: {
        "content-type": "application/json",
      },
    });

  it("returns leaderboard data", async () => {
    const getTopUsersByPoints = mock(() =>
      Promise.resolve([
        {
          id: "user_1",
          name: "Alice",
          image: "alice.png",
          points: 10,
        },
      ]),
    );

    const router = createPointsRouter({ getTopUsersByPoints });

    const response = await router.request(
      request("http://localhost/top?limit=5"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: [
        {
          id: "user_1",
          name: "Alice",
          image: "alice.png",
          points: 10,
        },
      ],
    });
    expect(getTopUsersByPoints).toHaveBeenCalledWith(5);
  });

  it("rejects non-positive limits", async () => {
    const getTopUsersByPoints = mock();

    const router = createPointsRouter({ getTopUsersByPoints });

    const response = await router.request(
      request("http://localhost/top?limit=0"),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        issues: [
          {
            code: "too_small",
            path: ["limit"],
          },
        ],
      },
    });
    expect(getTopUsersByPoints).not.toHaveBeenCalled();
  });

  it("rejects non-numeric limits", async () => {
    const getTopUsersByPoints = mock();

    const router = createPointsRouter({ getTopUsersByPoints });

    const response = await router.request(
      request("http://localhost/top?limit=abc"),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        issues: [
          {
            code: "invalid_type",
            path: ["limit"],
          },
        ],
      },
    });
    expect(getTopUsersByPoints).not.toHaveBeenCalled();
  });
});
