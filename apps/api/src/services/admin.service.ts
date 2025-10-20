import db from "@/db";
import { report } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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
