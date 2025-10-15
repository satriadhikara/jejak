import { createRouter } from "@/lib/create-router";
import { requireAuth } from "@/middlewares/require-auth";
import {
  getUserReportById,
  getUserReports,
  createReport,
  deleteReportById,
} from "@/services/report.service";
import {
  reportCreateBodyValidator,
  reportDeleteParamsValidator,
  reportGetQueryValidator,
  // reportUpdateBodyValidator,
  // reportUpdateParamsValidator,
} from "@/validators/report.validator";

type ReportRouteDependencies = {
  getUserReports: typeof getUserReports;
  getUserReportById: typeof getUserReportById;
  createReport: typeof createReport;
  deleteReportById: typeof deleteReportById;
};

const defaultDependencies: ReportRouteDependencies = {
  getUserReports,
  getUserReportById,
  createReport,
  deleteReportById,
};

export const createReportRoute = (
  deps: ReportRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAuth);

  router.get("/", async (c) => {
    const user = c.get("user")!;

    const reports = await deps.getUserReports(user.id);

    return c.json({
      data: reports,
    });
  });

  router.get("/:id", reportGetQueryValidator, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    const report = await deps.getUserReportById(user.id, id);

    return c.json({
      data: report,
    });
  });

  router.post("/", reportCreateBodyValidator, async (c) => {
    const user = c.get("user")!;
    const {
      id,
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

    const report = await deps.createReport({
      userId: user.id,
      reportId: id,
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
  });

  // router.patch(
  //   "/:id",
  //   reportUpdateParamsValidator,
  //   reportUpdateBodyValidator,
  //   async (c) => {
  //     const user = c.get("user")!;
  //   },
  // );

  router.delete("/:id", reportDeleteParamsValidator, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.valid("param");

    await deps.deleteReportById(id, user.id);

    return c.json({ message: "Report deleted successfully" }, 200);
  });

  return router;
};
