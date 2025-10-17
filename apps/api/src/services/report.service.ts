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
    const result = await db.insert(report).values({
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
    });

    return result;
  };

  // const updateReportById = async({
  //   reportId,
  //   userId,
  //   title,
  //   locationName,
  //   locationGeo,
  // });

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

export async function deleteReportById(reportId: string, userId: string) {
  return reportService.deleteReportById(reportId, userId);
}
