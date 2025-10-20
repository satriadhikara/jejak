import { useQuery } from "@tanstack/react-query";
import { getCookie } from "@/lib/auth-client";

export type AdminStats = {
  totalLaporan: number;
  laporanBaru: number;
  dalamProses: number;
  selesai: number;
  laporanBaruHariIni: number;
  laporanTidakDiperbarui: number;
};

export const useAdminStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const baseURL = process.env.EXPO_PUBLIC_API_URL;
      const cookies = getCookie();

      const response = await fetch(`${baseURL}/api/admin/stats`, {
        method: "GET",
        headers: {
          Cookie: cookies || "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }

      const result = await response.json();
      return result.data as AdminStats;
    },
  });

  return { stats: data, isLoading, error };
};
