import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/beranda/report-card';
import ReportDraftCardRiwayat from '@/components/riwayat/report-draft-card';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Avatar } from 'react-native-paper';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getUserReports } from '@/utils/api/riwayat.api';
import type { UserReport } from '@/utils/types/riwayat.types';

type StatusDisplayConfig = {
  label: string;
  color: string;
  bgColor: string;
};

const STATUS_DISPLAY: Record<UserReport['status'] | 'default', StatusDisplayConfig> = {
  diperiksa: {
    label: 'Diperiksa',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi',
    color: '#055987',
    bgColor: '#F0F9FF',
  },
  dalam_penanganan: {
    label: 'Dalam penanganan',
    color: '#9D530E',
    bgColor: '#FFFBED',
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
    label: 'Diperiksa',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
};

const FILTER_OPTIONS = [
  'Semua',
  'Diperiksa',
  'Dikonfirmasi',
  'Dalam penanganan',
  'Selesai ditangani',
  'Ditolak',
];

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

const mapUserReportToHistoryItem = (report: UserReport): ReportHistoryItem => {
  const config = STATUS_DISPLAY[report.status] ?? STATUS_DISPLAY.default;

  return {
    id: report.id,
    title: report.title,
    date: formatReportDate(report.createdAt),
    location: report.locationName,
    status: config.label,
    statusColor: config.color,
    statusBgColor: config.bgColor,
  };
};

export default function RiwayatScreen() {
  const router = useRouter();
  const { session, cookies } = useAuthContext();
  const [activeTab, setActiveTab] = useState('Laporan');
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const reportHistoryQuery = useQuery<Awaited<ReturnType<typeof getUserReports>>>({
    queryKey: ['userReports', cookies, activeTab === 'Draft'],
    queryFn: () => getUserReports(cookies, activeTab === 'Draft'),
    enabled: Boolean(cookies),
  });

  const handleCreateReport = () => {
    console.log('Navigating to report creation screen');
  };

  const handleViewReportDetail = (reportId: string) => {
    router.push({
      pathname: '/riwayat-detail',
      params: { id: reportId },
    });
  };

  const tabs = ['Laporan', 'Draft'];

  const draftCount = useMemo(
    () =>
      (reportHistoryQuery.data?.data ?? []).filter((report) => report.status === 'draft').length,
    [reportHistoryQuery.data]
  );

  const isLoadingReports = reportHistoryQuery.isPending;
  const isErrorReports = reportHistoryQuery.isError;
  const errorMessage =
    reportHistoryQuery.error instanceof Error
      ? reportHistoryQuery.error.message
      : 'Terjadi kesalahan saat memuat riwayat laporan.';

  const reportsForActiveTab = useMemo(() => {
    const reports = reportHistoryQuery.data?.data ?? [];

    if (activeTab === 'Draft') {
      return reports.filter((report) => report.status === 'draft');
    }

    return reports.filter((report) => report.status !== 'draft');
  }, [activeTab, reportHistoryQuery.data]);

  const normalizedReports = useMemo(
    () => reportsForActiveTab.map(mapUserReportToHistoryItem),
    [reportsForActiveTab]
  );

  // 2. Filter by status (only for Laporan tab)
  const filteredByStatus =
    activeTab === 'Laporan' && filter !== 'Semua'
      ? normalizedReports.filter((report) => report.status === filter)
      : normalizedReports;

  // 3. Filter by search query (applies for both tabs)
  const filteredReports = filteredByStatus.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#FAFAFB] pt-14">
      {/* Header */}
      <View className="mb-6 flex-row items-center justify-between px-5">
        <Text className="font-inter-semi-bold text-lg text-[#242528]">Riwayat</Text>
        <Pressable onPress={() => router.push('/profil')}>
          <Avatar.Image size={40} source={{ uri: session.user.image ?? '' }} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="mx-5 mb-6 flex-row items-center rounded-full border border-[#E5E6E8] bg-white px-4 py-1">
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          placeholder="Cari laporan"
          placeholderTextColor="#8E8E93"
          className="ml-2 flex-1 font-inter-medium text-sm text-gray-600"
          value={searchQuery}
          onChangeText={setSearchQuery} // 4. Make input work
        />
      </View>

      {/* Tabs */}
      <View className="mb-2 flex-row justify-between">
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="relative flex-1 items-center pb-2">
            <Text
              className={`text-base ${
                activeTab === tab
                  ? 'font-inter-semi-bold text-[#1859F8]'
                  : 'font-inter-semi-bold text-gray-400'
              }`}>
              {tab}
            </Text>
            {tab === 'Draft' && (
              <View
                className={`absolute right-16 top-1 rounded-full border px-1.5 ${
                  activeTab === 'Draft'
                    ? 'border-[#D9E8FF] bg-[#EDF6FF]'
                    : 'border-[#F5F5F6] bg-[#FAFAFB]'
                }`}>
                <Text
                  className={`font-inter-medium text-xs ${
                    activeTab === 'Draft' ? 'text-[#2F7AFF]' : 'text-gray-400'
                  }`}>
                  {draftCount}
                </Text>
              </View>
            )}
            {activeTab === tab && (
              <View className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-600" />
            )}
          </Pressable>
        ))}
      </View>

      <View className="flex-1 pb-14">
        {isLoadingReports ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#1859F8" />
          </View>
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
            {activeTab === 'Laporan' && (
              <View className="mb-2 mt-2 flex-row items-center">
                <Feather name="filter" size={22} color="#585A63" className="mr-2" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 0 }}>
                  {FILTER_OPTIONS.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setFilter(item)}
                      className={`mr-2 h-10 rounded-full border px-4 py-2 ${
                        filter === item
                          ? 'border-blue-600 bg-[#F6FBFF]'
                          : 'border-[#E5E6E8] bg-white'
                      }`}>
                      <Text
                        className={`text-sm ${
                          filter === item
                            ? 'font-inter-medium text-sm text-blue-600'
                            : 'font-inter-medium text-sm text-gray-800'
                        }`}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {filteredReports.length > 0 ? (
              activeTab === 'Laporan' ? (
                filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    handleViewReportDetail={handleViewReportDetail}
                    variant="secondary"
                  />
                ))
              ) : (
                filteredReports.map((report) => (
                  <ReportDraftCardRiwayat
                    key={report.id}
                    report={report}
                    handleViewReportDetail={handleViewReportDetail}
                  />
                ))
              )
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
