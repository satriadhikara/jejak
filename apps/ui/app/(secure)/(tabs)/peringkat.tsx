import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import RankingCard from '@/components/beranda/ranking-card';
import { useQuery } from '@tanstack/react-query';
import { getTopUsersByPoints, getUserPoints } from '@/utils/api/beranda.api';
import { Skeleton, SkeletonCircle } from '@/components/Skeleton';
import {
  UserPointsResponse,
  TopUsersByPointsResponse,
  TopUsersByPointsItem,
} from '@/utils/types/beranda.types';

export default function Peringkat() {
  const { session, cookies } = useAuthContext();
  const router = useRouter();

  const userPoints = useQuery<UserPointsResponse>({
    queryKey: ['userPoints', cookies],
    queryFn: () => getUserPoints(cookies),
  });

  const topUsersRankings = useQuery<TopUsersByPointsResponse>({
    queryKey: ['topUsersRankings', cookies, 7],
    queryFn: () => getTopUsersByPoints(cookies, 7),
  });

  const handleNavigateToProfile = () => {
    router.push('/profil');
  };

  // Show loading state
  if (topUsersRankings.isLoading || userPoints.isLoading) {
    return (
      <View className="relative flex-1 bg-transparent pt-10">
        {/* Background Image */}
        <Image
          source={require('@/assets/ProfilBG.png')}
          className="absolute left-0 top-0 h-full w-full"
          resizeMode="cover"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="px-5">
          {/* Header Skeleton */}
          <View className="my-2 flex-row items-center justify-between px-4 py-4">
            <Skeleton width={80} height={24} />
            <SkeletonCircle size={40} />
          </View>

          {/* Top 3 section skeleton */}
          <View className="h-[163px] flex-row items-end justify-center">
            {/* Rank 2 */}
            <View className="mx-3 w-24 items-center">
              <SkeletonCircle size={80} />
              <Skeleton width={60} height={14} className="mt-3" />
              <Skeleton width={70} height={12} className="mt-1" />
            </View>

            {/* Rank 1 */}
            <View className="mx-10 mb-2 w-28 items-center">
              <SkeletonCircle size={96} />
              <Skeleton width={80} height={16} className="mt-3" />
              <Skeleton width={90} height={12} className="mt-1" />
            </View>

            {/* Rank 3 */}
            <View className="mx-3 w-24 items-center">
              <SkeletonCircle size={80} />
              <Skeleton width={60} height={14} className="mt-3" />
              <Skeleton width={70} height={12} className="mt-1" />
            </View>
          </View>

          {/* Ranking list skeleton */}
          <View className="mt-6 gap-2">
            {[1, 2, 3, 4].map((i) => (
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
          </View>
        </ScrollView>
      </View>
    );
  }

  // Show error state
  if (topUsersRankings.isError || userPoints.isError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0A1A2F] px-5">
        <Text className="font-inter-semi-bold text-lg text-red-400">Terjadi Kesalahan</Text>
        <Text className="mt-2 text-center font-inter-regular text-white">
          Gagal memuat data peringkat
        </Text>
        <TouchableOpacity
          onPress={() => {
            topUsersRankings.refetch();
            userPoints.refetch();
          }}
          className="mt-4 rounded-lg bg-[#00D996] px-6 py-3">
          <Text className="font-inter-semi-bold text-white">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userData = {
    name: session.user.name || 'You',
    avatar: session.user.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    rank: userPoints.data?.data.rank || 0,
    points: userPoints.data?.data.points || 0,
  };

  // Transform API data to match UI format
  const topUsers: TopUsersByPointsItem[] =
    topUsersRankings.data?.data.map((user, index) => ({
      id: user.id,
      rank: index + 1,
      name: user.name,
      avatar: user.image,
      points: user.points,
      isCurrentUser: user.id === session.user.id, // Check if it's current user
    })) || [];

  // Check if current user is in top 7
  const currentUserInTop7 = topUsers.some((u) => u.isCurrentUser);

  // Create complete list with current user if they're outside top 7
  const allUsers = currentUserInTop7
    ? topUsers
    : [
        ...topUsers,
        {
          id: session.user.id || 'me',
          name: userData.name,
          points: userData.points,
          avatar: userData.avatar,
          rank: userData.rank,
          isCurrentUser: true,
        },
      ];

  // Top 3 for podium display
  const top3 = allUsers.slice(0, 3);

  // Rest of the users (rank 4-7)
  const rest = allUsers.slice(3);

  // Show divider if current user is outside top 7
  const showDivider = !currentUserInTop7 && userData.rank > 7;

  return (
    <View className="relative flex-1 bg-transparent pt-10">
      {/* Background Image */}
      <Image
        source={require('@/assets/ProfilBG.png')}
        className="absolute left-0 top-0 h-full w-full"
        resizeMode="cover"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-5">
        {/* Header */}
        <View className="my-2 flex-row items-center justify-between px-4 py-4">
          <Text className="font-inter-semi-bold text-lg text-white">Peringkat</Text>
          <TouchableOpacity onPress={handleNavigateToProfile}>
            <Avatar.Image size={40} source={{ uri: userData.avatar }} />
          </TouchableOpacity>
        </View>

        {/* Top 3 section */}
        {top3.length >= 3 && (
          <View className="h-[163px] flex-row items-end justify-center">
            {/* Rank 2 */}
            <View className="mx-3 w-24 items-center">
              <Image
                source={{ uri: top3[1].avatar }}
                className="h-20 w-20 rounded-full border-4 border-[#C0C0C0]"
              />
              <View className="absolute -top-1 right-2 h-6 w-6 items-center justify-center rounded-full bg-[#C0C0C0]">
                <Text className="font-inter-semi-bold text-sm text-white">2</Text>
              </View>
              <Text
                className="mt-3 font-inter-semi-bold text-sm text-[#00D996]"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 80 }}>
                {top3[1].name}
              </Text>
              <Text
                className="font-inter-regular text-xs text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 80 }}>
                {top3[1].points} Poin Jejak
              </Text>
            </View>

            {/* Rank 1 */}
            <View className="mx-10 mb-2 w-28 items-center">
              <Image
                source={{ uri: top3[0].avatar }}
                className="h-24 w-24 rounded-full border-4 border-[#FFCC02]"
              />
              <View className="absolute -top-2 right-5 items-center justify-center">
                <Image
                  source={require('@/assets/crown.png')}
                  className="h-6 w-6"
                  resizeMode="contain"
                />
              </View>
              <Text
                className="mt-3 font-inter-semi-bold text-base text-[#00D996]"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 100 }}>
                {top3[0].name}
              </Text>
              <Text
                className="font-inter-regular text-xs text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 100 }}>
                {top3[0].points} Poin Jejak
              </Text>
            </View>

            {/* Rank 3 */}
            <View className="mx-3 w-24 items-center">
              <Image
                source={{ uri: top3[2].avatar }}
                className="h-20 w-20 rounded-full border-4 border-[#CD7F32]"
              />
              <View className="absolute -top-1 right-2 h-6 w-6 items-center justify-center rounded-full bg-[#CD7F32]">
                <Text className="font-inter-semi-bold text-sm text-white">3</Text>
              </View>
              <Text
                className="mt-3 font-inter-semi-bold text-sm text-[#00D996]"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 80 }}>
                {top3[2].name}
              </Text>
              <Text
                className="font-inter-regular text-xs text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 80 }}>
                {top3[2].points} Poin Jejak
              </Text>
            </View>
          </View>
        )}

        {/* Ranking list (4–7) */}
        {rest.length > 0 && (
          <View className="mt-6 gap-2">
            {rest.map((user) => (
              <RankingCard
                key={user.id}
                user={{
                  id: user.id,
                  rank: user.rank,
                  name: user.name,
                  avatar: user.avatar,
                  points: user.points,
                  isCurrentUser: user.isCurrentUser,
                }}
              />
            ))}
          </View>
        )}

        {/* If current user rank > 7, show divider and user rank card */}
        {showDivider && (
          <>
            {/* Dotted divider */}
            <View className="my-3 flex-row justify-center">
              <Text className="text-2xl font-bold text-[#F6FBFF]">•••</Text>
            </View>
            <RankingCard
              user={{
                id: session.user.id || 'me',
                rank: userData.rank,
                name: userData.name,
                avatar: userData.avatar,
                points: userData.points,
                isCurrentUser: true,
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
