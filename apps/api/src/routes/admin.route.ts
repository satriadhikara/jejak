import { createRouter } from "@/lib/create-router";
import { requireAdmin } from "@/middlewares/require-admin";
import {
  getAdminStats,
  getAllReports,
  getNewReports,
  getInProgressReports,
  getCompletedReports,
  getStaleReports,
  getAdminReportById,
  updateReportStatus,
  createReportCompletion,
} from "@/services/admin.service";
import { addPoints } from "@/services/points.service";
import { z } from "zod";

const completeReportSchema = z.object({
  handlingDescription: z.string().min(1, "Handling description is required"),
  notes: z.string().optional(),
  completionImages: z
    .array(z.object({ key: z.string() }))
    .min(1, "At least one completion image is required"),
});

type AdminRouteDependencies = {
  getAdminStats: typeof getAdminStats;
  getAllReports: typeof getAllReports;
  getNewReports: typeof getNewReports;
  getInProgressReports: typeof getInProgressReports;
  getCompletedReports: typeof getCompletedReports;
  getStaleReports: typeof getStaleReports;
  getAdminReportById: typeof getAdminReportById;
  updateReportStatus: typeof updateReportStatus;
  createReportCompletion: typeof createReportCompletion;
  addPoints: typeof addPoints;
};

const defaultDependencies: AdminRouteDependencies = {
  getAdminStats,
  getAllReports,
  getNewReports,
  getInProgressReports,
  getCompletedReports,
  getStaleReports,
  getAdminReportById,
  updateReportStatus,
  createReportCompletion,
  addPoints,
};

export const createAdminRouter = (
  deps: AdminRouteDependencies = defaultDependencies,
) => {
  const router = createRouter();

  router.use("/*", requireAdmin);

  router.get("/stats", async (c) => {
    try {
      const stats = await deps.getAdminStats();
      return c.json({ data: stats });
    } catch (error) {
      console.error("Error in admin stats endpoint:", error);
      return c.json({ error: "Failed to fetch admin statistics" }, 500);
    }
  });

  router.get("/reports", async (c) => {
    try {
      const reports = await deps.getAllReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin reports endpoint:", error);
      return c.json({ error: "Failed to fetch admin reports" }, 500);
    }
  });

  router.get("/reports/new", async (c) => {
    try {
      const reports = await deps.getNewReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin new reports endpoint:", error);
      return c.json({ error: "Failed to fetch new reports" }, 500);
    }
  });

  router.get("/reports/in-progress", async (c) => {
    try {
      const reports = await deps.getInProgressReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin in-progress reports endpoint:", error);
      return c.json({ error: "Failed to fetch in-progress reports" }, 500);
    }
  });

  router.get("/reports/completed", async (c) => {
    try {
      const reports = await deps.getCompletedReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin completed reports endpoint:", error);
      return c.json({ error: "Failed to fetch completed reports" }, 500);
    }
  });

  router.get("/reports/stale", async (c) => {
    try {
      const reports = await deps.getStaleReports();
      return c.json({ data: reports });
    } catch (error) {
      console.error("Error in admin stale reports endpoint:", error);
      return c.json({ error: "Failed to fetch stale reports" }, 500);
    }
  });

  router.get("/reports/:id", async (c) => {
    try {
      const { id } = c.req.param();
      const report = await deps.getAdminReportById(id);

      if (!report) {
        return c.json({ error: "Report not found" }, 404);
      }

      return c.json({ data: report });
    } catch (error) {
      console.error("Error in admin report detail endpoint:", error);
      return c.json({ error: "Failed to fetch report details" }, 500);
    }
  });

  router.patch("/reports/:id/status", async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();
      const { status, statusHistory } = body;

      // Validate status transition
      const currentReport = await deps.getAdminReportById(id);
      if (!currentReport) {
        return c.json({ error: "Report not found" }, 404);
      }

      // Award points based on status transition
      let pointsAwarded = 0;
      let pointsReason = "";

      if (
        currentReport.status === "diperiksa" &&
        (status === "dikonfirmasi" || status === "dalam_penanganan")
      ) {
        pointsAwarded = 10;
        pointsReason = "Report confirmed by admin";
      } else if (
        currentReport.status === "dalam_penanganan" &&
        status === "selesai"
      ) {
        pointsAwarded = 15;
        pointsReason = "Report completion confirmed";
      }

      // Update report status
      const updatedReport = await deps.updateReportStatus(
        id,
        status,
        statusHistory,
      );

      // Award points to reporter if applicable
      if (pointsAwarded > 0) {
        await deps.addPoints(
          currentReport.reporterId,
          pointsAwarded,
          pointsReason,
          id,
        );
      }

      return c.json({ data: updatedReport });
    } catch (error) {
      console.error("Error in admin update report status endpoint:", error);
      return c.json({ error: "Failed to update report status" }, 500);
    }
  });

  router.post("/reports/:id/complete", async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      // Validate request body
      const validation = completeReportSchema.safeParse(body);
      if (!validation.success) {
        return c.json(
          {
            error: "Invalid request body",
            details: validation.error.issues,
          },
          400,
        );
      }

      const { handlingDescription, notes, completionImages } = validation.data;

      // Check if report exists and is in correct status
      const currentReport = await deps.getAdminReportById(id);
      if (!currentReport) {
        return c.json({ error: "Report not found" }, 404);
      }

      if (currentReport.status !== "dalam_penanganan") {
        return c.json(
          {
            error:
              "Report must be in 'dalam_penanganan' status to be completed",
          },
          400,
        );
      }

      // Create completion record
      const completion = await deps.createReportCompletion(
        id,
        handlingDescription,
        completionImages,
        notes,
      );

      // Update report status to selesai
      const newHistory = [
        ...(currentReport.statusHistory || []),
        {
          status: "selesai" as const,
          timestamp: new Date().toISOString(),
          description: "Penyelesaian laporan dikonfirmasi oleh admin",
        },
      ];

      const updatedReport = await deps.updateReportStatus(
        id,
        "selesai",
        newHistory,
      );

      // Award 15 points to reporter
      await deps.addPoints(
        currentReport.reporterId,
        15,
        "Report completion confirmed",
        id,
      );

      return c.json({
        data: {
          completion,
          report: updatedReport,
          pointsAwarded: 15,
        },
      });
    } catch (error) {
      console.error("Error in admin complete report endpoint:", error);
      return c.json({ error: "Failed to complete report" }, 500);
    }
  });

  return router;
};

export default createAdminRouter();
