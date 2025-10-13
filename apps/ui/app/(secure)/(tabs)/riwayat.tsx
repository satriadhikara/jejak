import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import ReportCard from '@/components/beranda/report-card';
import ReportDraftCardRiwayat from '@/components/riwayat/report-draft-card';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';

export default function RiwayatScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Laporan');
  const [filter, setFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState(''); // 1. Add search state

  const handleCreateReport = () => {
    console.log('Navigating to report creation screen');
  };

  const handleViewReportDetail = (reportId: number) => {
    router.push('/riwayat-detail');
    // If you want to pass the reportId, use: router.push(`/riwayat-detail?id=${reportId}`);
  };

  const tabs = ['Laporan', 'Draft'];
  const filters = ['Semua', 'Diperiksa', 'Dikonfirmasi', 'Dalam penanganan', 'Selesai ditangani'];

  const reportHistory: ReportHistoryItem[] = [
    {
      id: 1,
      title: 'Kerusakan Trotoar ITB jatinangor',
      date: '3 Oktober 2025',
      location: 'Jl. Ganesa No.10, Lb. Siliwangi',
      status: 'Diperiksa',
      statusColor: '#717680',
      statusBgColor: '#F5F5F6',
    },
    {
      id: 2,
      title: 'Kerusakan Trotoar ITB Ganesha',
      date: '3 Oktober 2025',
      location: 'Jl. Ganesa No.10, Lb. Siliwangi',
      status: 'Dikonfirmasi',
      statusColor: '#055987',
      statusBgColor: '#F0F9FF',
    },
    {
      id: 3,
      title: 'Kerusakan Trotoar ITB Cirebon',
      date: '3 Oktober 2025',
      location: 'Jl. Ganesa No.10, Lb. Siliwangi',
      status: 'Dalam penanganan',
      statusColor: '#9D530E',
      statusBgColor: '#FFFBED',
    },
    {
      id: 4,
      title: 'Kerusakan Trotoar ITB Ganesha',
      date: '3 Oktober 2025',
      location: 'Jl. Ganesa No.10, Lb. Siliwangi',
      status: 'Selesai ditangani',
      statusColor: '#055E3A',
      statusBgColor: '#ECFEF3',
    },
  ];
  // const reportHistory: ReportHistoryItem[] = [];

  // 2. Filter by status (only for Laporan tab)
  const filteredByStatus =
    activeTab === 'Laporan'
      ? filter === 'Semua'
        ? reportHistory
        : reportHistory.filter((report) => report.status === filter)
      : reportHistory;

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
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          className="h-9 w-9 rounded-full"
        />
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
                  3
                </Text>
              </View>
            )}
            {activeTab === tab && (
              <View className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-600" />
            )}
          </Pressable>
        ))}
      </View>

      {reportHistory.length > 0 ? (
        <View className="flex-1 pb-14">
          <ScrollView
            className="px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {activeTab === 'Laporan' && (
              <View className="mb-2 mt-2 flex-row items-center">
                <Feather name="filter" size={22} color="#585A63" className="mr-2" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 0 }}>
                  {filters.map((item) => (
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

            {/* Report Cards or Draft Cards */}
            {activeTab === 'Laporan' ? (
              filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    handleViewReportDetail={handleViewReportDetail}
                    variant="secondary"
                  />
                ))
              ) : (
                <EmptyReportHistory handleCreateReport={handleCreateReport} />
              )
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportDraftCardRiwayat
                  key={report.id}
                  report={report}
                  handleViewReportDetail={handleViewReportDetail}
                />
              ))
            ) : (
              <EmptyReportHistory handleCreateReport={handleCreateReport} />
            )}
          </ScrollView>
        </View>
      ) : (
        <View className="mb-28 flex-1 items-center justify-center">
          <EmptyReportHistory handleCreateReport={handleCreateReport} />
        </View>
      )}
    </View>
  );
}
