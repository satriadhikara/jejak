import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Pressable,
} from 'react-native';
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

  const reportHistoryQuery = useQuery<Awaited<ReturnType<typeof getUserReports>>>({
    queryKey: ['userReports', cookies, false],
    queryFn: () => getUserReports(cookies, false),
    enabled: Boolean(cookies),
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

  const reportHistory = useMemo(() => {
    const reports = reportHistoryQuery.data?.data ?? [];
    // Get only non-draft reports, limited to first 2
    return reports
      .filter((report) => report.status !== 'draft')
      .slice(0, 2)
      .map(mapUserReportToHistoryItem);
  }, [reportHistoryQuery.data]);

  const handleCreateReport = () => {
    router.push('/(secure)/(tabs)/kamera');
  };

  const handleViewAllReports = () => {
    router.push('/(secure)/(tabs)/riwayat');
  };

  const handleViewReportDetail = (reportId: string) => {
    router.push({
      pathname: '/riwayat/[riwayatId]',
      params: { riwayatId: reportId },
    });
  };

  const handleViewAllRankings = () => {
    router.push('/(secure)/(tabs)/peringkat');
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
            <View
              className="flex-row items-center"
              style={{ maxWidth: 200 }} // or remove and let it fill the parent width
            >
              <Text className="font-inter-semi-bold text-lg text-white">Halo, </Text>

              <Text
                className="font-inter-semi-bold text-lg text-secondary"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flexShrink: 1, minWidth: 0 }} // minWidth:0 helps on RN Web
              >
                {userData.name}
              </Text>

              <Text className="font-inter-semi-bold text-lg text-white">!👋</Text>
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
        <Pressable
          onPress={() => router.push('/(secure)/admin/dashboard')}
          className="mb-20 ml-4 flex-row items-center gap-2">
          <Text className="font-inter-semi-bold text-base text-[#3848F4]">Admin</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
