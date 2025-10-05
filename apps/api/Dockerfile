FROM oven/bun:latest AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]

