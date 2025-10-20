import db from "@/db";
import { report } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { CreateReportInput } from "@/types/report.types";

type ReportServiceDependencies = {
  db: typeof db;
};

export type ReportService = ReturnType<typeof createReportService>;

export const createReportService = ({ db }: ReportServiceDependencies) => {
  const getUserReports = async (userId: string, draft: boolean) => {
    const reports = await db
      .select()
      .from(report)
      .where(
        draft
          ? and(eq(report.reporterId, userId), eq(report.status, "draft"))
          : eq(report.reporterId, userId),
      )
      .orderBy(desc(report.createdAt));

    return reports;
  };

  const getUserReportById = async (reportId: string, userId: string) => {
    const [reportData] = await db
      .select()
      .from(report)
      .where(and(eq(report.id, reportId), eq(report.reporterId, userId)))
      .limit(1);

    return reportData;
  };

  const createReport = async ({
    userId,
    reportId,
    title,
    locationName,
    locationGeo,
    damageCategory,
    impactOfDamage,
    description,
    photosUrls,
    status,
    statusHistory,
  }: CreateReportInput) => {
    const [reportData] = await db
      .insert(report)
      .values({
        id: reportId,
        reporterId: userId,
        title,
        locationName,
        locationGeo,
        damageCategory,
        impactOfDamage,
        description,
        photosUrls,
        status,
        statusHistory,
      })
      .returning();

    return reportData;
  };

  const updateReportById = async (
    reportId: string,
    userId: string,
    updates: Partial<Omit<CreateReportInput, "userId" | "reportId">>,
  ) => {
    // Build update object only with provided fields
    const updateData: Record<string, unknown> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.locationName !== undefined)
      updateData.locationName = updates.locationName;
    if (updates.locationGeo !== undefined)
      updateData.locationGeo = updates.locationGeo;
    if (updates.damageCategory !== undefined)
      updateData.damageCategory = updates.damageCategory;
    if (updates.impactOfDamage !== undefined)
      updateData.impactOfDamage = updates.impactOfDamage;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.photosUrls !== undefined)
      updateData.photosUrls = updates.photosUrls;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.statusHistory !== undefined)
      updateData.statusHistory = updates.statusHistory;

    const [reportData] = await db
      .update(report)
      .set(updateData)
      .where(and(eq(report.id, reportId), eq(report.reporterId, userId)))
      .returning();

    return reportData;
  };

  const deleteReportById = async (reportId: string, userId: string) => {
    await db
      .delete(report)
      .where(and(eq(report.id, reportId), eq(report.reporterId, userId)));

    return true;
  };

  const getCompletedReportsInBounds = async (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) => {
    console.log("Querying completed reports with bounds:", {
      minLat,
      maxLat,
      minLng,
      maxLng,
    });

    // Ensure min/max are in correct order
    const actualMinLat = Math.min(minLat, maxLat);
    const actualMaxLat = Math.max(minLat, maxLat);
    const actualMinLng = Math.min(minLng, maxLng);
    const actualMaxLng = Math.max(minLng, maxLng);

    console.log("Adjusted bounds for query:", {
      actualMinLat,
      actualMaxLat,
      actualMinLng,
      actualMaxLng,
    });

    // Fetch all completed reports (there won't be many)
    const allReports = await db
      .select({
        id: report.id,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        createdAt: report.createdAt,
      })
      .from(report)
      .where(eq(report.status, "selesai"))
      .orderBy(desc(report.createdAt));

    console.log(`Total completed reports in database: ${allReports.length}`);

    // Filter in JavaScript
    const reportsInBounds = allReports.filter((r) => {
      const lat = r.locationGeo.lat;
      const lng = r.locationGeo.lng;
      const latMatch = lat >= actualMinLat && lat <= actualMaxLat;
      const lngMatch = lng >= actualMinLng && lng <= actualMaxLng;

      console.log(
        `  ${r.title}: lat=${lat} (${latMatch}), lng=${lng} (${lngMatch})`,
      );

      return latMatch && lngMatch;
    });

    console.log(`Found ${reportsInBounds.length} completed reports in bounds`);

    return reportsInBounds;
  };

  return {
    getUserReports,
    createReport,
    getUserReportById,
    updateReportById,
    deleteReportById,
    getCompletedReportsInBounds,
  };
};

const reportService = createReportService({ db });

export async function getUserReports(userId: string, draft: boolean = false) {
  return reportService.getUserReports(userId, draft);
}

export async function getUserReportById(reportId: string, userId: string) {
  return reportService.getUserReportById(reportId, userId);
}

export async function createReport(input: CreateReportInput) {
  return reportService.createReport(input);
}

export async function updateReportById(
  reportId: string,
  userId: string,
  input: Partial<Omit<CreateReportInput, "userId" | "reportId">>,
) {
  return reportService.updateReportById(reportId, userId, input);
}

export async function deleteReportById(reportId: string, userId: string) {
  return reportService.deleteReportById(reportId, userId);
}

export async function getCompletedReportsInBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
) {
  return reportService.getCompletedReportsInBounds(
    minLat,
    maxLat,
    minLng,
    maxLng,
  );
}
