import db from "@/db";
import { report, user } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

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

    return {
      totalLaporan: totalReports.length,
      laporanBaru: newReports.length,
      dalamProses: inProgressReports.length,
      selesai: completedReports.length,
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
