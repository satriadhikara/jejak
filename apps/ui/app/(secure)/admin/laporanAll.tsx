import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/admin/report-card'; // ✅ uses your new card
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';

const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Kerusakan Trotoar ITB Ganesha',
    createdAt: '2025-10-03T10:00:00Z',
    locationName: 'Jl. Ganesa No.10, Lb. Siliwangi jsbahubfhasbfhabfhabfsabfa',
    status: 'diperiksa',
    reporterName: 'Sarah Mahendra',
    reporterImage: 'https://i.pravatar.cc/150?img=47',
    severity: 'Ringan',
  },
  {
    id: '2',
    title: 'Lampu Lalu Lintas Mati',
    createdAt: '2025-09-25T09:00:00Z',
    locationName: 'Jl. Sudirman',
    status: 'dikonfirmasi',
    reporterName: 'Dimas Wiratama',
    reporterImage: 'https://i.pravatar.cc/150?img=22',
    severity: 'Sedang',
  },
  {
    id: '3',
    title: 'Pohon Tumbang Menutupi Jalan',
    createdAt: '2025-09-20T16:00:00Z',
    locationName: 'Jl. Ahmad Yani',
    status: 'dalam_penanganan',
    reporterName: 'Ayu Pertiwi',
    reporterImage: 'https://i.pravatar.cc/150?img=12',
    severity: 'Berat',
  },
  {
    id: '4',
    title: 'Sampah Menumpuk di Trotoar',
    createdAt: '2025-09-18T07:00:00Z',
    locationName: 'Jl. Kebon Jeruk',
    status: 'selesai',
    reporterName: 'Rudi Santoso',
    reporterImage: 'https://i.pravatar.cc/150?img=40',
    severity: 'Ringan',
  },
];

const STATUS_DISPLAY = {
  diperiksa: {
    label: 'Belum diperiksa',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
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
  selesai: {
    label: 'Selesai ditangani',
    color: '#055E3A',
    bgColor: '#ECFEF3',
  },
  default: {
    label: 'Belum diperiksa',
    color: '#717680',
    bgColor: '#F5F5F6',
  },
};

const FILTER_OPTIONS = [
  'Semua',
  'Belum diperiksa',
  'Terkonfirmasi',
  'Dalam penanganan',
  'Selesai ditangani',
];

const formatReportDate = (isoString: string) => {
  const parsedDate = new Date(isoString);
  return parsedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function LaporanAll() {
  const router = useRouter();
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mappedReports: ReportHistoryItem[] = useMemo(
    () =>
      MOCK_REPORTS.map((report) => {
        const cfg =
          STATUS_DISPLAY[report.status as keyof typeof STATUS_DISPLAY] ?? STATUS_DISPLAY.default;
        return {
          id: report.id,
          title: report.title,
          date: formatReportDate(report.createdAt),
          location: report.locationName,
          status: cfg.label,
          statusColor: cfg.color,
          statusBgColor: cfg.bgColor,
          reporterName: report.reporterName,
          reporterImage: report.reporterImage,
          severity: report.severity,
        };
      }),
    []
  );

  const filteredByStatus =
    filter !== 'Semua' ? mappedReports.filter((r) => r.status === filter) : mappedReports;

  const filteredReports = filteredByStatus.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateReport = () => {
    console.log('Navigate to create report');
  };

  const handleViewReportDetail = (id: string) => {
    router.push(`/riwayat/${id}`);
  };

  return (
    <View className="flex-1 bg-[#FAFAFB] pt-14">
      {/* Header */}
      <View className="mb-3 flex-row items-center px-3 gap-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>
        <Text className="font-inter-semi-bold text-lg text-[#242528]">Laporan</Text>
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

      {/* Filter */}
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
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#1859F8" />
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
