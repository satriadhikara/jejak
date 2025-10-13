import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import RankingCard from '@/components/beranda/ranking-card';

export default function Peringkat() {
  const session = useAuthContext();
  const router = useRouter();

  const handleNavigateToProfile = () => {
    router.push('/profil');
  };

  const userData = {
    name: session?.session?.user?.name || 'You',
    avatar:
      session?.session?.user?.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    rank: 24, // Example user rank (outside top 7)
    points: 100,
    up: -4,
  };

  const rankingTop3 = [
    {
      id: '2',
      name: 'Kim Woobin',
      points: 645,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rank: 2,
      isCurrentUser: false,
    },
    {
      id: '1',
      name: 'WangXiaoXia',
      points: 650,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      rank: 1,
      isCurrentUser: false,
    },
    {
      id: '3',
      name: 'Olivia Reyn',
      points: 645,
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      rank: 3,
      isCurrentUser: false,
    },
  ];

  const rankingList = [
    { id: '4', name: 'DuozhuaMiao', points: 150, up: 1 },
    { id: '5', name: 'Lee Beu-li', points: 140, up: 2 },
    { id: '6', name: 'Lee Beu-li', points: 130, up: 2 },
    { id: '7', name: 'Lee Beu-li', points: 120, up: 2 },
  ];

  const allUsers = [
    ...rankingTop3,
    ...rankingList.map((item) => ({
      id: item.id,
      name: item.name,
      points: item.points,
      avatar: 'https://randomuser.me/api/portraits/men/70.jpg',
      rank: Number(item.id),
      isCurrentUser: false,
    })),
    {
      id: 'me',
      name: userData.name,
      points: userData.points,
      avatar: userData.avatar,
      rank: userData.rank,
      isCurrentUser: true,
    },
  ];

  // Sort all users by points descending
  const sortedAllUsers = [...allUsers].sort((a, b) => b.points - a.points);

  // Top 3
  const top3 = sortedAllUsers.slice(0, 3);

  // The rest (4 until current user)
  const rest = sortedAllUsers.slice(3);

  // Find if current user is outside top 7
  const currentUserIndex = sortedAllUsers.findIndex((u) => u.isCurrentUser);
  const showDivider = currentUserIndex > 6;

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
        <View className="h-[163px] flex-row items-end justify-center">
          {/* Rank 2 */}
          <View className="mx-3 items-center">
            <Image
              source={{ uri: top3[1].avatar }}
              className="h-20 w-20 rounded-full border-4 border-[#C0C0C0]"
            />
            <View className="absolute -top-1 right-2 h-6 w-6 items-center justify-center rounded-full bg-[#C0C0C0]">
              <Text className="font-inter-semi-bold text-sm text-white">2</Text>
            </View>
            <Text className="mt-3 font-inter-semi-bold text-sm text-[#00D996]">{top3[1].name}</Text>
            <Text className="font-inter-regular text-xs text-white">
              {top3[1].points} Poin Jejak
            </Text>
          </View>

          {/* Rank 1 */}
          <View className="mx-10 mb-2 items-center">
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
            <Text className="mt-3 font-inter-semi-bold text-base text-[#00D996]">
              {top3[0].name}
            </Text>
            <Text className="font-inter-regular text-xs text-white">
              {top3[0].points} Poin Jejak
            </Text>
          </View>

          {/* Rank 3 */}
          <View className="mx-3 items-center">
            <Image
              source={{ uri: top3[2].avatar }}
              className="h-20 w-20 rounded-full border-4 border-[#CD7F32]"
            />
            <View className="absolute -top-1 right-2 h-6 w-6 items-center justify-center rounded-full bg-[#CD7F32]">
              <Text className="font-inter-semi-bold text-sm text-white">3</Text>
            </View>
            <Text className="mt-3 font-inter-semi-bold text-sm text-[#00D996]">{top3[2].name}</Text>
            <Text className="font-inter-regular text-xs text-white">
              {top3[2].points} Poin Jejak
            </Text>
          </View>
        </View>

        {/* Ranking list (4–current user) */}
        <View className="mt-6 gap-2">
          {rest.slice(0, 4).map((user, idx) => (
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

        {/* If current user rank > 7, show divider and user rank card */}
        {showDivider && (
          <>
            {/* Dotted divider */}
            <View className="my-3 flex-row justify-center">
              <Text className="text-2xl font-bold text-[#F6FBFF]">•••</Text>
            </View>
            <RankingCard
              user={{
                id: 'me',
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
