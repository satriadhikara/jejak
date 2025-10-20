import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/admin/report-card';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getInProgressReports } from '@/utils/api/admin.api';
import type { AdminReport } from '@/utils/types/admin.types';
import { Skeleton } from '@/components/Skeleton';

type StatusDisplayConfig = {
  label: string;
  color: string;
  bgColor: string;
};

const STATUS_DISPLAY: Record<AdminReport['status'] | 'default', StatusDisplayConfig> = {
  dikonfirmasi: {
    label: 'Terkonfirmasi',
    color: '#055987',
    bgColor: '#F0F9FF',
  },
  dalam_penanganan: {
    label: 'Dalam penanganan',
    color: '#9D530E',
    bgColor: '#FFFBED',
  },
  diperiksa: {
    label: 'Belum diperiksa',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
  selesai: {
    label: 'Selesai ditangani',
    color: '#055E3A',
    bgColor: '#ECFEF3',
  },
  draft: {
    label: 'Draft',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
  ditolak: {
    label: 'Ditolak',
    color: '#B42318',
    bgColor: '#FEE4E2',
  },
  default: {
    label: 'Dalam penanganan',
    color: '#9D530E',
    bgColor: '#FFFBED',
  },
};

const FILTER_OPTIONS = ['Waktu pelaporan', 'Tingkat keparahan'];

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
  const config = STATUS_DISPLAY[report.status] ?? STATUS_DISPLAY.default;

  return {
    id: report.id,
    title: report.title,
    date: formatReportDate(report.createdAt),
    location: report.locationName,
    status: config.label,
    statusColor: config.color,
    statusBgColor: config.bgColor,
    reporterName: report.reporterName,
    reporterImage: report.reporterImage ?? undefined,
    severity: SEVERITY_DISPLAY[report.damageCategory],
  };
};

export default function LaporanOnProccess() {
  const router = useRouter();
  const { cookies } = useAuthContext();
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const inProgressReportsQuery = useQuery<Awaited<ReturnType<typeof getInProgressReports>>>({
    queryKey: ['adminInProgressReports', cookies],
    queryFn: () => getInProgressReports(cookies),
    enabled: Boolean(cookies),
  });

  const isLoadingReports = inProgressReportsQuery.isPending;
  const isErrorReports = inProgressReportsQuery.isError;
  const errorMessage =
    inProgressReportsQuery.error instanceof Error
      ? inProgressReportsQuery.error.message
      : 'Terjadi kesalahan saat memuat laporan dalam proses.';

  const reports = useMemo(() => {
    const allReports = inProgressReportsQuery.data?.data ?? [];
    return allReports.map(mapAdminReportToHistoryItem);
  }, [inProgressReportsQuery.data]);

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Text className="font-inter-semi-bold text-lg text-[#242528]">Laporan Dalam Proses</Text>
      </View>

      {/* Search Bar */}
      <View className="mx-5 mb-4 flex-row items-center rounded-full border border-[#E5E6E8] bg-white px-4 py-1">
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          placeholder="Cari laporan"
          placeholderTextColor="#8E8E93"
          className="ml-2 flex-1 font-inter-medium text-sm text-gray-600"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="mb-2 mt-1 gap-3 flex-row items-center px-5">
        <Feather name="filter" size={22} color="#585A63" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_OPTIONS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              className={`mr-2 h-10 rounded-full border px-4 py-2 ${
                filter === item ? 'border-blue-600 bg-[#F6FBFF]' : 'border-[#E5E6E8] bg-white'
              }`}>
              <Text
                className={`text-sm ${
                  filter === item
                    ? 'font-inter-medium text-blue-600'
                    : 'font-inter-medium text-gray-800'
                }`}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
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
