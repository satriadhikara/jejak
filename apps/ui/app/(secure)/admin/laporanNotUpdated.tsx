import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/admin/report-card';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getStaleReports } from '@/utils/api/admin.api';
import type { AdminReport } from '@/utils/types/admin.types';
import { Skeleton } from '@/components/Skeleton';

type StatusDisplayConfig = {
  label: string;
  color: string;
  bgColor: string;
};

const STATUS_DISPLAY: StatusDisplayConfig = {
  label: 'Dalam penanganan',
  color: '#9D530E',
  bgColor: '#FFFBED',
};

const SEVERITY_DISPLAY: Record<AdminReport['damageCategory'], 'Ringan' | 'Sedang' | 'Berat'> = {
  berat: 'Berat',
  sedang: 'Sedang',
  ringan: 'Ringan',
};

const formatReportDate = (isoString: string) => {
  if (!isoString) {
    return '-';
  }

  const parsedDate = new Date(isoString);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const mapAdminReportToHistoryItem = (report: AdminReport): ReportHistoryItem => {
  return {
    id: report.id,
    title: report.title,
    date: formatReportDate(report.createdAt),
    location: report.locationName,
    status: STATUS_DISPLAY.label,
    statusColor: STATUS_DISPLAY.color,
    statusBgColor: STATUS_DISPLAY.bgColor,
    reporterName: report.reporterName,
    reporterImage: report.reporterImage ?? undefined,
    severity: SEVERITY_DISPLAY[report.damageCategory],
  };
};

export default function LaporanNotUpdated() {
  const router = useRouter();
  const { cookies } = useAuthContext();

  const staleReportsQuery = useQuery<Awaited<ReturnType<typeof getStaleReports>>>({
    queryKey: ['adminStaleReports', cookies],
    queryFn: () => getStaleReports(cookies),
    enabled: Boolean(cookies),
  });

  const isLoadingReports = staleReportsQuery.isPending;
  const isErrorReports = staleReportsQuery.isError;
  const errorMessage =
    staleReportsQuery.error instanceof Error
      ? staleReportsQuery.error.message
      : 'Terjadi kesalahan saat memuat laporan yang belum diperbarui.';

  const reports = useMemo(() => {
    const allReports = staleReportsQuery.data?.data ?? [];
    return allReports.map(mapAdminReportToHistoryItem);
  }, [staleReportsQuery.data]);

  const handleCreateReport = () => {
    console.log('Navigate to create report');
  };

  const handleViewReportDetail = (id: string) => {
    router.push(`/(secure)/admin/report/${id}`);
  };

  return (
    <View className="flex-1 bg-[#FAFAFB] pt-14">
      {/* Header */}
      <View className="mb-3 flex-row items-center px-3 gap-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>
        <Text className="font-inter-semi-bold text-lg text-[#242528]">
          Laporan Dalam Penanganan
        </Text>
      </View>

      <View className="mx-5 rounded-xl bg-[#FEF3F2] px-3 py-3 flex-row items-start">
        <Ionicons name="alert-circle" size={18} color="#DA2828" style={{ marginTop: 2 }} />
        <View className="ml-3 flex-1">
          <Text className="font-inter-semi-bold text-sm text-[#DA2828]">
            Segera periksa penyelesaian kerusakan
          </Text>
          <Text className="font-inter-regular text-xs text-[#DA2828] mt-1 leading-5">
            Daftar laporan dibawah ini sudah dalam status “Dalam penanganan” selama lebih dari 7
            hari.
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 pb-14">
        {isLoadingReports ? (
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
            {/* Skeleton loading cards */}
            {[1, 2, 3].map((i) => (
              <View key={i} className="mt-3 rounded-xl border border-[#E5E6E8] bg-white p-4">
                <View className="gap-2">
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="90%" height={12} />
                  <Skeleton width="60%" height={12} />
                </View>
              </View>
            ))}
          </ScrollView>
        ) : isErrorReports ? (
          <View className="mb-28 flex-1 items-center justify-center px-5">
            <Text className="text-center font-inter-medium text-sm text-[#B42318]">
              {errorMessage}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
            {reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  handleViewReportDetail={handleViewReportDetail}
                  variant="secondary"
                />
              ))
            ) : (
              <View className="mb-28 flex-1 items-center justify-center">
                <EmptyReportHistory handleCreateReport={handleCreateReport} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
