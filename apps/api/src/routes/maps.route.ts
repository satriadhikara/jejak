import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";
import { mapsAnalyzeBodyValidator } from "@/validators/maps.validator";
import { analyze } from "@/services/maps.service";

type MapsRouteDependencies = {};

const defaultDependencies: MapsRouteDependencies = {};

export const createMapsRoute = (
  _dependencies: MapsRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.post("/analyze", mapsAnalyzeBodyValidator, async (c) => {
    const body = c.req.valid("json");

    const analyzeResult = await analyze(body);

    if (analyzeResult.status === "error") {
      const statusCode =
        analyzeResult.code === "BAD_REQUEST"
          ? 400
          : analyzeResult.code === "NO_IMAGERY"
            ? 404
            : analyzeResult.code === "PROVIDER_RATE_LIMIT"
              ? 429
              : analyzeResult.code === "MODEL_FAILURE"
                ? 503
                : 500; // INTERNAL

      return c.json(analyzeResult, statusCode);
    }

    return c.json(analyzeResult, 200);
  });

  return router;
};

export default createMapsRoute();
