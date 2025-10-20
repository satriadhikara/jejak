import db from "@/db";
import { report, user, reportCompletion } from "@/db/schema";
import { eq, inArray, desc, and, lte, gte } from "drizzle-orm";

export const getAdminStats = async () => {
  try {
    // Total Laporan: all reports except draft and ditolak
    const totalReports = await db
      .select()
      .from(report)
      .where(
        inArray(report.status, [
          "diperiksa",
          "dikonfirmasi",
          "dalam_penanganan",
          "selesai",
        ]),
      );

    // Laporan Baru: only diperiksa
    const newReports = await db
      .select()
      .from(report)
      .where(eq(report.status, "diperiksa"));

    // Dalam Proses: dikonfirmasi and dalam_penanganan
    const inProgressReports = await db
      .select()
      .from(report)
      .where(inArray(report.status, ["dikonfirmasi", "dalam_penanganan"]));

    // Selesai: selesai
    const completedReports = await db
      .select()
      .from(report)
      .where(eq(report.status, "selesai"));

    // New reports created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newReportsToday = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.status, "diperiksa"),
          gte(report.createdAt, today),
          lte(report.createdAt, tomorrow),
        ),
      );

    // Reports in "dalam_penanganan" not updated for more than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleReports = await db
      .select()
      .from(report)
      .where(
        and(
          eq(report.status, "dalam_penanganan"),
          lte(report.updatedAt, sevenDaysAgo),
        ),
      );

    return {
      totalLaporan: totalReports.length,
      laporanBaru: newReports.length,
      dalamProses: inProgressReports.length,
      selesai: completedReports.length,
      laporanBaruHariIni: newReportsToday.length,
      laporanTidakDiperbarui: staleReports.length,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export const getAllReports = async () => {
  try {
    const reports = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw error;
  }
};

export const getNewReports = async () => {
  try {
    const reports = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .where(eq(report.status, "diperiksa"))
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error fetching new reports:", error);
    throw error;
  }
};

export const getInProgressReports = async () => {
  try {
    const reports = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .where(inArray(report.status, ["dikonfirmasi", "dalam_penanganan"]))
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error fetching in-progress reports:", error);
    throw error;
  }
};

export const getCompletedReports = async () => {
  try {
    const reports = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .where(eq(report.status, "selesai"))
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error fetching completed reports:", error);
    throw error;
  }
};

export const getStaleReports = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reports = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .where(
        and(
          eq(report.status, "dalam_penanganan"),
          lte(report.updatedAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(report.createdAt));

    return reports;
  } catch (error) {
    console.error("Error fetching stale reports:", error);
    throw error;
  }
};

export const getAdminReportById = async (reportId: string) => {
  try {
    const [reportData] = await db
      .select({
        id: report.id,
        reporterId: report.reporterId,
        reporterName: user.name,
        reporterImage: user.image,
        title: report.title,
        locationName: report.locationName,
        locationGeo: report.locationGeo,
        damageCategory: report.damageCategory,
        impactOfDamage: report.impactOfDamage,
        description: report.description,
        photosUrls: report.photosUrls,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        statusHistory: report.statusHistory,
      })
      .from(report)
      .innerJoin(user, eq(report.reporterId, user.id))
      .where(eq(report.id, reportId))
      .limit(1);

    return reportData;
  } catch (error) {
    console.error("Error fetching admin report by ID:", error);
    throw error;
  }
};

export const updateReportStatus = async (
  reportId: string,
  status: (typeof report.status.enumValues)[number],
  statusHistory: Array<{
    status: (typeof report.status.enumValues)[number];
    timestamp: string;
    description: string;
  }>,
) => {
  try {
    const [reportData] = await db
      .update(report)
      .set({
        status,
        statusHistory,
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId))
      .returning();

    return reportData;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
};

export const createReportCompletion = async (
  reportId: string,
  handlingDescription: string,
  completionImages: { key: string }[],
  notes?: string,
) => {
  try {
    const completionId = Bun.randomUUIDv7("base64url");

    const [completion] = await db
      .insert(reportCompletion)
      .values({
        id: completionId,
        reportId,
        handlingDescription,
        notes: notes || null,
        completionImages,
      })
      .returning();

    return completion;
  } catch (error) {
    console.error("Error creating report completion:", error);
    throw error;
  }
};
