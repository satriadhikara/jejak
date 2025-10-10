# Jejak API (Hono + Bun)

Backend service built with [Hono](https://hono.dev/) on Bun, structured to follow the official best-practice guidance for modular route composition.

## Getting Started

Install dependencies:

```sh
bun install
```

Run the development server:

```sh
bun run dev
```

The app listens on `http://localhost:3000` by default.

## Project Structure

```
src/
  app.ts                   # Hono instance with global middleware and base path
  index.ts                 # Bun entrypoint exporting { port, fetch }
  lib/
    env.ts                 # Zod-validated environment loader
    auth.ts                # Better Auth configuration
  validators/
    leaderboard.ts         # zValidator-powered schemas for leaderboard routes
  routes/
    index.ts               # Registers feature routers with app.route()
    health.route.ts        # Route factory for health endpoints
    leaderboard.route.ts   # Route factory for leaderboard endpoints
  services/
    health.service.ts      # Business logic with dependency inject-able factory
    leaderboard.service.ts # Leaderboard queries against Drizzle models
  db/
    schema.ts              # Drizzle schema definitions
    index.ts               # Drizzle client setup
tests/
  setup.ts                 # bun test preloads (env validation, globals)
  integration/
    app.test.ts            # End-to-end contract for the HTTP server
  routes/
    health.route.test.ts   # Route-level contract tests
    leaderboard.route.test.ts
  services/
    health.service.test.ts # Unit tests for domain logic
    leaderboard.service.test.ts
```

## Routing Guidelines

- Keep handlers close to their route definitions. Each feature exports a dedicated `Hono` router file (e.g. `routes/health.ts`).
- Mount feature routers inside `routes/index.ts` via `routes.route("/feature", featureRoutes)`.
- Avoid Rails-style controller classes; inline handlers preserve Hono’s path-param type inference per the [official guidance](https://hono.dev/docs/guides/best-practices).
- Use middleware with `app.use()` or within feature routers to layer cross-cutting concerns (auth, logging, etc.).

## Services & Data Access

- Place domain logic and Drizzle ORM calls inside `src/services`. Keep functions pure and return plain data objects.
- Inject services into route handlers directly; the handler should only parse request input, call the service, and format the response.
- Share DTOs or validation schemas via dedicated modules (e.g. `src/schemas`) if needed.

## Request Validation

- Use [`@hono/zod-validator`](https://github.com/honojs/middleware/tree/main/packages/zod-validator) to guard incoming requests.
- Define reusable schemas in `src/validators` and export configured middlewares (e.g. `leaderboardTopQueryValidator`).
- In routes, attach the validator as middleware so `c.req.valid("query")` exposes strongly-typed, sanitized inputs.

## Leaderboard Endpoint

- `GET /leaderboard/top`: returns the top users ordered by `points` with an optional `limit` query param (default 10, max 100).
- The handler relies on `leaderboardTopQueryValidator` to coerce and bound `limit`, and `getTopUsersByPoints` to fetch the data via Drizzle.
- Response shape: `{ data: Array<{ id, name, image, points }> }`.

## Adding a New Feature

1. Create `src/routes/<feature>.ts` exporting a `new Hono()` instance with inline handlers.
2. Add any supporting service functions under `src/services/<feature>.service.ts`.
3. Register the router in `src/routes/index.ts`:
   ```ts
   import featureRoutes from "@/routes/feature";

   routes.route("/feature", featureRoutes);
   ```
4. Wire up middleware or validation as needed.

### Service and Router Factories

- Each service exports a `create...Service` factory that receives its dependencies (database client, logger, time helpers). This keeps functions pure, simplifies mocking, and matches Hono’s lightweight philosophy.
- Route modules export `create...Router` factories so tests can instantiate isolated routers without bootstrapping the entire app.
- Default singletons are exported for runtime use (`export default create...Router()`), mirroring Bun’s module caching while remaining test friendly.

Following this pattern keeps the API consistent with Hono’s best practices while leaving room for modular expansion.

## Environment Variables

- Define required variables in `.env` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_ORIGIN`, optional `PORT`).
- `src/lib/env.ts` validates values on startup with Zod v4—misconfigured environments throw immediately with contextual error logs.

## Testing

- All tests run with [Bun Test](https://bun.sh/docs/test). Preload configuration lives in `bunfig.toml`, which ensures environment validation runs once per test process.
- Execute the full suite:

  ```sh
  bun test
  ```

- Watch for changes:

  ```sh
  bun test --watch
  ```

- Generate coverage reports (HTML + text):

  ```sh
  bun test --coverage
  ```

- Tests are organised by layer to keep feedback focused:
  - `tests/services` for pure domain logic with injected dependencies.
  - `tests/routes` for router-level contracts using in-memory Hono requests.
  - `tests/integration` for end-to-end checks against the Bun server.

## Linting

- JavaScript/TypeScript linting uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for speed and broad rule coverage.
- Configuration lives in `.oxlintrc.json`; warnings fail with `deny: "warnings"`.
- Run locally:

  ```sh
  bun run lint
  ```

## CI

- Pull requests automatically run `bun test` via GitHub Actions (`.github/workflows/test.yaml`).
- Docker images only build from `develop` and `main` after tests succeed (`.github/workflows/deploy.yaml`).
- Tests in CI rely on secrets `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `CLIENT_ORIGIN`. Define them in repo or environment secrets.
- Local tests load `.env.test` by default (via `bun test --env-file .env.test`). Copy `.env.example` or create your own file with real values if needed.
- Provide production-like values in CI to keep env validation meaningful.
