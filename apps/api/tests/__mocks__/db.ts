import { mock } from "bun:test";

export const db = {
  execute: mock(),
  select: mock().mockReturnThis(),
  from: mock().mockReturnThis(),
  orderBy: mock().mockReturnThis(),
  limit: mock().mockResolvedValue([]),
};

export default db;
