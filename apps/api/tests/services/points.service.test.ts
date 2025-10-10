import { beforeEach, describe, expect, it, mock } from "bun:test";

import { createPointsService } from "@/services/points.service";

describe("points service", () => {
  let select: ReturnType<typeof mock>;
  let from: ReturnType<typeof mock>;
  let orderBy: ReturnType<typeof mock>;
  let limit: ReturnType<typeof mock>;

  const getService = () =>
    createPointsService({
      db: {
        select,
      } as unknown as Parameters<typeof createPointsService>[0]["db"],
    });

  const rows = [
    {
      id: "user_1",
      name: "Alice",
      image: "alice.png",
      points: 10,
    },
    {
      id: "user_2",
      name: "Bob",
      image: null,
      points: null,
    },
  ];

  beforeEach(() => {
    limit = mock().mockResolvedValue(rows);
    orderBy = mock().mockReturnValue({
      limit,
    });
    from = mock().mockReturnValue({
      orderBy,
    });
    select = mock().mockReturnValue({
      from,
    });
  });

  it("returns normalized leaderboard entries", async () => {
    const service = getService();

    const result = await service.getTopUsersByPoints(5);

    expect(result).toEqual([
      {
        id: "user_1",
        name: "Alice",
        image: "alice.png",
        points: 10,
      },
      {
        id: "user_2",
        name: "Bob",
        image: null,
        points: 0,
      },
    ]);

    expect(select).toHaveBeenCalled();
    expect(limit).toHaveBeenCalledWith(5);
  });
});
