import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  ToastAndroid,
} from 'react-native';
import { Avatar, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/lib/auth-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/Skeleton';

interface ReportHistoryItem {
  id: number;
  title: string;
  date: string;
  location: string;
  status: string;
  statusColor: string;
  statusBgColor: string;
}

const reportHistory: ReportHistoryItem[] = [
  {
    id: 1,
    title: 'Kerusakan Trotoar ITB Ganesha',
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
];

// const reportHistory: ReportHistoryItem[] = [];

const rankings = [
  {
    id: 1,
    rank: 1,
    name: 'WangXiaoXia',
    avatar: 'https://i.pravatar.cc/150?img=12',
    points: 150,
    isCurrentUser: false,
  },
  {
    id: 2,
    rank: 2,
    name: 'Lee Beu-li',
    avatar: 'https://i.pravatar.cc/150?img=18',
    points: 150,
    isCurrentUser: false,
  },
  {
    id: 3,
    rank: 24,
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=47',
    points: 150,
    isCurrentUser: true,
  },
];

const getUserPoints = async (cookies: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/points/user`, {
    headers: {
      Cookie: cookies,
    },
  });
  const data = await response.json();
  return data;
};

export default function Home() {
  const { session, cookies } = useAuthContext();
  const userPoints = useQuery({
    queryKey: ['userPoints'],
    queryFn: () => getUserPoints(cookies),
  });

  if (userPoints.isError) {
    ToastAndroid.show('Error: ' + userPoints.error.name, ToastAndroid.SHORT);
  }

  const userData = {
    name: session.user.name,
    avatar: session.user.image,
    points: userPoints.data?.points ?? 0,
  };

  const handleCreateReport = () => {
    // Handle create report navigation
    console.log('Navigate to create report');
  };

  const handleViewAllReports = () => {
    // Handle view all reports navigation
    console.log('Navigate to all reports');
  };

  const handleViewReportDetail = (reportId: number) => {
    // Handle view report detail navigation
    console.log('Navigate to report detail:', reportId);
  };

  const handleViewAllRankings = () => {
    // Handle view all rankings navigation
    console.log('Navigate to all rankings');
  };

  const handleNavigateToProfile = () => {
    router.push('/(secure)/profil');
  };

  return (
    <View className="relative flex-1 bg-[#FAFAFB]">
      <Image
        source={require('../../../assets/berandaBG.png')}
        className="absolute left-0 right-0 top-0 z-10 h-[158px]"
        resizeMode="cover"
      />

      <ScrollView className="z-20 flex-1 bg-transparent">
        <View className="mt-[35px] min-h-full rounded-t-[20px] bg-transparent p-4">
          {/* Header */}
          <View className="my-2 flex-row items-center justify-between px-2">
            <View>
              <Text className="font-inter-semi-bold text-lg text-white">
                Halo,{' '}
                <Text className="font-inter-semi-bold text-lg text-secondary">{userData.name}</Text>
                !👋
              </Text>
            </View>
            <TouchableOpacity onPress={handleNavigateToProfile}>
              <Avatar.Image size={40} source={{ uri: userData.avatar ?? '' }} />
            </TouchableOpacity>
          </View>

          {/* Points Card */}
          <Card className="mt-2.5 rounded-2xl">
            <Card.Content className="flex-row items-center justify-between rounded-2xl bg-white">
              <View>
                <Text className="font-inter-medium text-sm text-[#242528]">Poin Jejak</Text>
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="footsteps-outline" size={20} color="#00D996" />
                  {userPoints.isPending ? (
                    <Skeleton className="ml-1.5 text-lg font-bold text-[#242528]" width={50} />
                  ) : (
                    <Text className="ml-1.5 font-inter-medium text-2xl text-[#242528]">
                      {userData.points} poin
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                className="items-center justify-center rounded-[50px] bg-[#EBF4FF] px-[18px] py-2.5"
                onPress={handleCreateReport}>
                <Text className="font-inter-semi-bold text-sm text-[#2431AE]">Buat Laporan</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Report History Section */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="font-inter-semi-bold text-base text-[#242528]">Riwayat Laporanmu</Text>
            <TouchableOpacity onPress={handleViewAllReports}>
              <Text className="font-inter-semi-bold text-xs text-primary-600">Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {/* Report Cards */}
          {reportHistory.length > 0 ? (
            reportHistory.map((report) => (
              <Card
                key={report.id}
                className="mt-2.5 rounded-xl !bg-white"
                style={{
                  padding: 4,
                }}>
                <Card.Content style={{ padding: 0, margin: 0 }} className="!m-0 !p-0">
                  <Text className="font-inter-medium">{report.title}</Text>
                  <Text className="mt-1.5 font-inter-regular text-sm text-[#ABAFB5]">
                    {report.date} • {report.location}
                  </Text>

                  <View className="mb-2 mt-4 h-[1px] bg-[#E5E5E5]" />

                  <View className="flex-row items-center justify-between">
                    <View className="gap-1">
                      <Text className="font-inter-se text-xs text-[#ABAFB5]">Status</Text>
                      <View
                        className="rounded-[25px] px-3 py-1"
                        style={{ backgroundColor: report.statusBgColor }}>
                        <Text
                          className="font-inter-medium text-sm"
                          style={{ color: report.statusColor }}>
                          {report.status}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="items-center justify-center rounded-lg bg-[#1437B9] px-4 py-2.5"
                      onPress={() => handleViewReportDetail(report.id)}>
                      <Text className="font-inter-semi-bold text-sm text-[#F5F5F6]">
                        Lihat detail
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View className="mt-2.5 py-14">
              <View className="items-center justify-center gap-2 px-10">
                <Image
                  source={require('../../../assets/empty.png')}
                  style={{ width: 60, height: 60 }}
                />
                <Text className="mt-2 text-center font-inter-semi-bold text-sm text-black">
                  Belum ada laporan
                </Text>
                <Text className="mt-1 text-center font-inter-regular text-xs text-black">
                  Kamu belum pernah membuat laporan. Yuk, mulai laporkan kerusakan pertama kamu!
                </Text>
                <Pressable
                  className="mt-4 items-center justify-center rounded-3xl border border-gray-300 bg-[#F5F5F6] px-4 py-2.5"
                  onPress={handleCreateReport}>
                  <Text className="text-sm font-semibold text-gray-700">Laporkan Kerusakan</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Ranking Section */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="font-inter-semi-bold text-base text-[#242528]">Peringkat</Text>
            <TouchableOpacity onPress={handleViewAllRankings}>
              <Text className="font-inter-semi-bold text-xs text-primary-600">Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {/* Ranking Cards */}
          {rankings.map((user) => (
            <View
              key={user.id}
              className={`mt-2 rounded-xl border p-3 ${
                user.isCurrentUser
                  ? 'border-[#9DBDFF] bg-[#DCEAFF]'
                  : 'border-[#E5E6E8] bg-[#F5F5F6]'
              }`}>
              <View className="flex-row items-center gap-2.5">
                <Text className="w-[25px] text-center text-base font-semibold text-[#2431AE]">
                  {user.rank}
                </Text>
                <Avatar.Image size={35} source={{ uri: user.avatar }} />
                <Text
                  className={`flex-1 text-[15px] font-medium ${
                    user.isCurrentUser ? 'text-[#2431AE]' : 'text-black'
                  }`}>
                  {user.name}
                </Text>
                <Text className="text-[13px] text-[#2431AE]">{user.points} Poin Jejak</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
