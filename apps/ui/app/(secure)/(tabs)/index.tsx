import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAuthContext } from '@/lib/auth-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import RankingCard from '@/components/beranda/ranking-card';
import EmptyReportHistory from '@/components/beranda/empty-report-histoy';
import {
  ReportHistoryItem,
  TopUsersByPointsItem,
  UserPointsResponse,
  TopUsersByPointsResponse,
} from '@/utils/types/beranda.types';
import ReportCard from '@/components/beranda/report-card';
import PointsCard from '@/components/beranda/points-card';
import { Skeleton, SkeletonCircle } from '@/components/Skeleton';
import { getUserPoints, getTopUsersByPoints } from '@/utils/api/beranda.api';

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

export default function Home() {
  const { session, cookies } = useAuthContext();

  const userPoints = useQuery<UserPointsResponse>({
    queryKey: ['userPoints', cookies],
    queryFn: () => getUserPoints(cookies),
  });

  const topUsersByPoints = useQuery<TopUsersByPointsResponse>({
    queryKey: ['topUsersByPoints', cookies, 3],
    queryFn: () => getTopUsersByPoints(cookies, 3),
  });

  if (userPoints.isError || topUsersByPoints.isError) {
    ToastAndroid.show(
      'Error: ' + userPoints.error?.name || topUsersByPoints.error?.name || '',
      ToastAndroid.SHORT
    );
  }

  const userData = {
    name: session.user.name,
    avatar: session.user.image,
    points: userPoints.data?.data?.points ?? 0,
    rank: userPoints.data?.data?.rank ?? 0,
  };

  const topUsersRankings: TopUsersByPointsItem[] =
    topUsersByPoints.data?.data?.map((user, index) => ({
      id: user.id,
      rank: index + 1,
      name: user.name,
      avatar: user.image ?? '',
      points: user.points,
      isCurrentUser: user.id === session.user.id,
    })) ?? [];

  // If current user is not in top 3, add them to the list
  const rankings: TopUsersByPointsItem[] = topUsersRankings.some((u) => u.isCurrentUser)
    ? topUsersRankings
    : [
        ...topUsersRankings,
        {
          id: session.user.id,
          rank: userData.rank,
          name: userData.name,
          avatar: userData.avatar ?? '',
          points: userData.points,
          isCurrentUser: true,
        },
      ];

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

      <ScrollView
        className="z-20 flex-1 bg-transparent"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 70 }}>
        <View className="mt-[35px] rounded-t-[20px] bg-transparent p-4 pb-20">
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
          <PointsCard
            isPending={userPoints.isPending}
            points={userData.points}
            onCreateReport={handleCreateReport}
          />

          {/* Report History Section */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="font-inter-semi-bold text-base text-[#242528]">Riwayat Laporanmu</Text>
            <TouchableOpacity onPress={handleViewAllReports}>
              <Text className="font-inter-semi-bold text-xs text-[#3848F4]">Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {/* Report Cards */}
          {reportHistory.length > 0 ? (
            reportHistory.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                handleViewReportDetail={handleViewReportDetail}
                variant="primary" // show the first button
              />
            ))
          ) : (
            <EmptyReportHistory handleCreateReport={handleCreateReport} />
          )}

          {/* Ranking Section */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text className="font-inter-semi-bold text-base text-[#242528]">Peringkat</Text>
            <TouchableOpacity onPress={handleViewAllRankings}>
              <Text className="font-inter-semi-bold text-xs text-[#3848F4]">Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {/* Ranking Cards */}
          {topUsersByPoints.isPending || userPoints.isPending ? (
            // Loading skeletons matching RankingCard dimensions
            <>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="mt-2 rounded-xl border border-[#E5E6E8] bg-[#F5F5F6] p-3 py-4">
                  <View className="flex-row items-center gap-4">
                    <Skeleton width={25} height={16} />
                    <SkeletonCircle size={35} />
                    <View className="flex-1 gap-1">
                      <Skeleton width="50%" height={12} />
                      <Skeleton width="40%" height={10} />
                    </View>
                    <Skeleton width={20} height={28} />
                  </View>
                </View>
              ))}
            </>
          ) : (
            rankings.map((user) => <RankingCard key={user.id} user={user} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}
