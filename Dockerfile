FROM oven/bun:latest AS base

WORKDIR /app

# Copy root-level workspace configuration
COPY package.json bun.lock tsconfig.json ./

# Copy workspace package.json files for proper dependency resolution
# Note: UI package.json is needed for lockfile resolution only - UI source code is NOT copied
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/ui/package.json ./apps/ui/

# Install all dependencies (includes both workspaces for lockfile compatibility)
RUN bun install --frozen-lockfile

# Copy ONLY the API source code - mobile app (UI) is excluded
COPY apps/api ./apps/api

# Set working directory to the API app
WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]