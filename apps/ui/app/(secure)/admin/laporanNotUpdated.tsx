import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/admin/report-card';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import { useRouter } from 'expo-router';

const MOCK_REPORTS = [
  {
    id: '1',
    title: 'Kerusakan Trotoar ITB Ganesha',
    createdAt: '2025-10-03T10:00:00Z',
    locationName: 'Jl. Ganesa No.10, Lb. Siliwangi',
    reporterName: 'Sarah Mahendra',
    reporterImage: 'https://i.pravatar.cc/150?img=47',
    severity: 'Ringan',
  },
  {
    id: '2',
    title: 'Lampu Lalu Lintas Mati',
    createdAt: '2025-09-25T09:00:00Z',
    locationName: 'Jl. Sudirman',
    reporterName: 'Dimas Wiratama',
    reporterImage: 'https://i.pravatar.cc/150?img=22',
    severity: 'Sedang',
  },
  {
    id: '3',
    title: 'Pohon Tumbang Menutupi Jalan',
    createdAt: '2025-09-20T16:00:00Z',
    locationName: 'Jl. Ahmad Yani',
    reporterName: 'Ayu Pertiwi',
    reporterImage: 'https://i.pravatar.cc/150?img=12',
    severity: 'Berat',
  },
  {
    id: '4',
    title: 'Sampah Menumpuk di Trotoar',
    createdAt: '2025-09-18T07:00:00Z',
    locationName: 'Jl. Kebon Jeruk',
    reporterName: 'Rudi Santoso',
    reporterImage: 'https://i.pravatar.cc/150?img=40',
    severity: 'Ringan',
  },
];

const STATUS_DISPLAY = {
  label: 'Dalam penanganan',
  color: '#9D530E',
  bgColor: '#FFFBED',
};

const formatReportDate = (isoString: string) => {
  const parsedDate = new Date(isoString);
  return parsedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function LaporanOnProccess() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const mappedReports: ReportHistoryItem[] = useMemo(
    () =>
      MOCK_REPORTS.map((report) => ({
        id: report.id,
        title: report.title,
        date: formatReportDate(report.createdAt),
        location: report.locationName,
        status: STATUS_DISPLAY.label,
        statusColor: STATUS_DISPLAY.color,
        statusBgColor: STATUS_DISPLAY.bgColor,
        reporterName: report.reporterName,
        reporterImage: report.reporterImage,
        severity: report.severity,
      })),
    []
  );

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
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#1859F8" />
          </View>
        ) : (
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
            {mappedReports.length > 0 ? (
              mappedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  handleViewReportDetail={handleViewReportDetail}
                  variant="secondary"
                />
              ))
            ) : (
              <View className="mb-28 flex-1 items-center justify-center">
                <EmptyReportHistory handleCreateReport={() => {}} />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
