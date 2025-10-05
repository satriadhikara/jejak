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
  app.ts              # Hono instance with global middleware and base path
  index.ts            # Bun entrypoint exporting { port, fetch }
  lib/
    env.ts            # Zod-validated environment loader
    auth.ts           # Better Auth configuration
  routes/
    index.ts          # Registers feature routers with app.route()
    health.route.ts   # Example feature router (inline handlers per Hono guide)
  services/
    health.service.ts # Business logic and Drizzle access (domain-focused)
  db/
    schema.ts         # Drizzle schema definitions
    index.ts          # Drizzle client setup
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

## Adding a New Feature

1. Create `src/routes/<feature>.ts` exporting a `new Hono()` instance with inline handlers.
2. Add any supporting service functions under `src/services/<feature>.service.ts`.
3. Register the router in `src/routes/index.ts`:
   ```ts
   import featureRoutes from "@/routes/feature";

   routes.route("/feature", featureRoutes);
   ```
4. Wire up middleware or validation as needed.

Following this pattern keeps the API consistent with Hono’s best practices while leaving room for modular expansion.

## Environment Variables

- Define required variables in `.env` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_ORIGIN`, optional `PORT`).
- `src/lib/env.ts` validates values on startup with Zod v4—misconfigured environments throw immediately with contextual error logs.
