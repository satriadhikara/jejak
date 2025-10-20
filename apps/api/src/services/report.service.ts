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

  return {
    getUserReports,
    createReport,
    getUserReportById,
    updateReportById,
    deleteReportById,
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
