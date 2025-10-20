import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";
import {
  getUserReportById,
  getUserReports,
  createReport,
  updateReportById,
  deleteReportById,
} from "@/services/report.service";
import { addPoints } from "@/services/points.service";
import {
  reportCreateBodyValidator,
  reportUpdateParamsValidator,
  reportUpdateBodyValidator,
  reportDeleteParamsValidator,
  reportGetQueryValidator,
  reportGetParamsValidator,
} from "@/validators/report.validator";

type ReportRouteDependencies = {
  getUserReports: typeof getUserReports;
  getUserReportById: typeof getUserReportById;
  createReport: typeof createReport;
  updateReportById: typeof updateReportById;
  deleteReportById: typeof deleteReportById;
  addPoints: typeof addPoints;
};

const defaultDependencies: ReportRouteDependencies = {
  getUserReports,
  getUserReportById,
  createReport,
  updateReportById,
  deleteReportById,
  addPoints,
};

export const createReportRoute = (
  deps: ReportRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.get("/", reportGetQueryValidator, async (c) => {
    const user = c.get("user")!;
    const { draft } = c.req.valid("query");

    const reports = await deps.getUserReports(user.id, draft ?? false);

    return c.json({
      data: reports,
    });
  });

  router.get("/:id", reportGetParamsValidator, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    const report = await deps.getUserReportById(id, user.id);

    return c.json({
      data: report,
    });
  });

  router.post("/", reportCreateBodyValidator, async (c) => {
    const user = c.get("user")!;
    const {
      title,
      locationName,
      locationGeo,
      damageCategory,
      impactOfDamage,
      description,
      photosUrls,
      status,
      statusHistory,
    } = c.req.valid("json");

    const reportId = Bun.randomUUIDv7("base64url");

    const report = await deps.createReport({
      reportId,
      userId: user.id,
      title,
      locationName,
      locationGeo,
      damageCategory,
      impactOfDamage,
      description,
      photosUrls,
      status,
      statusHistory,
    });

    // Award 5 points if report is submitted (not just saved as draft)
    if (status === "diperiksa") {
      await deps.addPoints(user.id, 5, "Report submission reward", reportId);
    }

    return c.json({
      data: report,
    });
  });

  router.patch(
    "/:id",
    reportUpdateParamsValidator,
    reportUpdateBodyValidator,
    async (c) => {
      const user = c.get("user")!;
      const { id } = c.req.valid("param");
      const {
        title,
        locationName,
        locationGeo,
        damageCategory,
        impactOfDamage,
        description,
        photosUrls,
        status,
        statusHistory,
      } = c.req.valid("json");

      const report = await deps.updateReportById(id, user.id, {
        title,
        locationName,
        locationGeo,
        damageCategory,
        impactOfDamage,
        description,
        photosUrls,
        status,
        statusHistory,
      });

      return c.json({
        data: report,
      });
    },
  );

  router.delete("/:id", reportDeleteParamsValidator, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    await deps.deleteReportById(id, user.id);

    return c.json({ message: "Report deleted successfully" }, 200);
  });

  return router;
};
