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

    // TODO: Implement Street View analysis logic
    return c.json({
      success: true,
      message: "Route analysis endpoint ready",
      data: body,
    });
  });

  return router;
};

export default createMapsRoute();
