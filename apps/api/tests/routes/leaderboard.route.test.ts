import { describe, expect, it, mock } from "bun:test";

import { createLeaderboardRouter } from "@/routes/leaderboard.route";

describe("leaderboard routes", () => {
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

    const router = createLeaderboardRouter({ getTopUsersByPoints });

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

  it("validates query params", async () => {
    const getTopUsersByPoints = mock();

    const router = createLeaderboardRouter({ getTopUsersByPoints });

    const response = await router.request(
      request("http://localhost/top?limit=0"),
    );

    expect(response.status).toBe(400);
    expect(getTopUsersByPoints).not.toHaveBeenCalled();
  });
});
