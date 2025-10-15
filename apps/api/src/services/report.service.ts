import db from "@/db";
import { report } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

type ReportServiceDependencies = {
  db: typeof db;
};

export type ReportService = ReturnType<typeof createReportService>;

export const createReportService = ({ db }: ReportServiceDependencies) => {
  const getUserReports = async (userId: string) => {
    const reports = await db
      .select()
      .from(report)
      .where(eq(report.reporterId, userId))
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
  }: {
    userId: string;
    reportId: string;
    title: string;
    locationName: string;
    locationGeo: {
      lat: number;
      lng: number;
    };
    damageCategory: "berat" | "sedang" | "ringan";
    impactOfDamage?: string;
    description?: string;
    photosUrls: {
      key: string;
    }[];
    status:
      | "draft"
      | "diperiksa"
      | "dikonfirmasi"
      | "dalam_penanganan"
      | "selesai"
      | "ditolak";
    statusHistory: {
      status: typeof status;
      timestamp: string;
      description: string;
    }[];
  }) => {
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

export async function getUserReports(userId: string) {
  return reportService.getUserReports(userId);
}

export async function getUserReportById(reportId: string, userId: string) {
  return reportService.getUserReportById(reportId, userId);
}

export async function createReport({
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
}: {
  userId: string;
  reportId: string;
  title: string;
  locationName: string;
  locationGeo: {
    lat: number;
    lng: number;
  };
  damageCategory: "berat" | "sedang" | "ringan";
  impactOfDamage?: string;
  description?: string;
  photosUrls: {
    key: string;
  }[];
  status:
    | "draft"
    | "diperiksa"
    | "dikonfirmasi"
    | "dalam_penanganan"
    | "selesai"
    | "ditolak";
  statusHistory: {
    status: typeof status;
    timestamp: string;
    description: string;
  }[];
}) {
  return reportService.createReport({
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
  });
}

export async function deleteReportById(reportId: string, userId: string) {
  return reportService.deleteReportById(reportId, userId);
}
