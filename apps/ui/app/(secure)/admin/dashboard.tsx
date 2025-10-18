import React from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';

const dashboardStats = [
  {
    value: 216,
    label: 'Total Laporan',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    exportColor: '#4B4D53',
    image: require('../../../assets/circle-gray.png'),
  },
  {
    value: 23,
    label: 'Laporan Baru',
    color: 'text-[#2431AE]',
    bg: 'bg-[#EBF4FF]',
    exportColor: '#2431AE',
    image: require('../../../assets/circle-blue.png'),
  },
  {
    value: 72,
    label: 'Dalam Proses',
    color: 'text-[#F79008]',
    bg: 'bg-[#FFFDF6]',
    exportColor: '#F79008',
    image: require('../../../assets/circle-yellow.png'),
  },
  {
    value: 121,
    label: 'Selesai',
    color: 'text-[#12B76A]',
    bg: 'bg-[#F5FFFB]',
    exportColor: '#12B76A',
    image: require('../../../assets/circle-green.png'),
  },
];

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="relative flex-1 bg-transparent">
      {/* Background Image */}
      <Image
        source={require('@/assets/ProfilBG.png')}
        className="absolute left-0 top-0 h-full w-full"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 bg-black/30 px-5 pt-14"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="my-2 mb-5 flex-row items-center justify-between px-2">
          <View className="flex-row items-center" style={{ maxWidth: 200 }}>
            <Text className="font-inter-semi-bold text-lg text-white">Halo, </Text>
            <Text
              className="font-inter-semi-bold text-lg text-secondary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flexShrink: 1, minWidth: 0 }}>
              Budi
            </Text>
            <Text className="font-inter-semi-bold text-lg text-white">!👋</Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white/30"
            onPress={() => router.push('/admin/profil')}>
            <Text className="font-semibold text-white">BS</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-full bg-white px-4 py-2 shadow-sm">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Cari laporan"
            placeholderTextColor="#ABAFB5"
            className="ml-2 flex-1 font-inter-medium text-sm text-gray-800"
          />
        </View>

        {/* Summary Cards */}
        <View className="mb-3 rounded-2xl bg-white p-4">
          <Text className="mb-3 font-inter-medium text-base text-black">Ringkasan Hari Ini</Text>
          <View className="flex-row flex-wrap justify-between">
            {dashboardStats.map((stat, idx) => (
              <View
                key={stat.label}
                className={`w-[48%] ${stat.bg} rounded-xl ${idx < 2 ? 'p-6' : 'p-4'} relative mb-3 overflow-hidden`}>
                <Image
                  source={stat.image}
                  className="absolute bottom-0 right-0 h-32 w-44"
                  resizeMode="cover"
                />
                <Text className={`mb-1 font-inter-semi-bold text-3xl ${stat.color}`}>
                  {stat.value}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className={`font-inter-medium text-sm ${stat.color}`}>{stat.label}</Text>
                  <Pressable className="z-5 ml-2 rounded-full bg-white p-2">
                    <Entypo name="export" size={18} color={stat.exportColor} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <View className="rounded-2xl bg-white p-4">
            <Text className="mb-1 font-inter-medium text-base text-gray-950">
              Laporan Belum Diperbarui
            </Text>
            <Text className="mb-3 font-inter-regular text-sm text-gray-500">
              Ada laporan yang belum diperbarui lebih dari 7 hari. Pastikan proses penanganan tetap
              berjalan agar tidak tertunda terlalu lama.
            </Text>
            <Pressable className="rounded-xl bg-blue-50 py-2">
              <Text className="text-center font-inter-semi-bold text-sm text-[#2431AE]">
                Lihat daftar laporan →
              </Text>
            </Pressable>
          </View>

          <View className="rounded-2xl bg-white p-4">
            <Text className="mb-1 font-inter-medium text-base text-gray-950">
              Tindakan Diperlukan
            </Text>
            <Text className="mb-3 font-inter-regular text-sm text-gray-500">
              3 laporan baru menunggu peninjauan hari ini
            </Text>
            <Pressable className="rounded-xl bg-blue-50 py-2">
              <Text className="text-center font-inter-semi-bold text-sm text-[#2431AE]">
                Tinjau sekarang →
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
