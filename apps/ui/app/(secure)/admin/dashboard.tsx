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
        <View className="my-2 flex-row items-center justify-between px-2 mb-5">
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
            className="w-10 h-10 rounded-full bg-white/30 items-center justify-center"
            onPress={() => router.push('/admin/profil')}>
            <Text className="text-white font-semibold">BS</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-full flex-row items-center px-4 py-2 mb-3 shadow-sm">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Cari laporan"
            placeholderTextColor="#ABAFB5"
            className="ml-2 flex-1 text-sm text-gray-800 font-inter-medium"
          />
        </View>

        {/* Summary Cards */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-black text-base font-inter-medium mb-3">Ringkasan Hari Ini</Text>
          <View className="flex-row flex-wrap justify-between">
            {dashboardStats.map((stat, idx) => (
              <View
                key={stat.label}
                className={`w-[48%] ${stat.bg} rounded-xl ${idx < 2 ? 'p-6' : 'p-4'} mb-3 relative overflow-hidden`}>
                <Image
                  source={stat.image}
                  className="absolute right-0 bottom-0 h-32 w-44"
                  resizeMode="cover"
                />
                <Text className={`text-3xl font-inter-semi-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className={`text-sm font-inter-medium ${stat.color}`}>{stat.label}</Text>
                  <Pressable className="bg-white rounded-full p-2 ml-2 z-5">
                    <Entypo name="export" size={18} color={stat.exportColor} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-gray-950 font-inter-medium text-base mb-1">
              Laporan Belum Diperbarui
            </Text>
            <Text className="text-gray-500 font-inter-regular text-sm mb-3">
              Ada laporan yang belum diperbarui lebih dari 7 hari. Pastikan proses penanganan tetap
              berjalan agar tidak tertunda terlalu lama.
            </Text>
            <Pressable className="bg-blue-50 rounded-xl py-2">
              <Text className="text-[#2431AE] text-center font-inter-semi-bold text-sm">
                Lihat daftar laporan →
              </Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl p-4">
            <Text className="text-gray-950 font-inter-medium text-base mb-1">
              Tindakan Diperlukan
            </Text>
            <Text className="text-gray-500 font-inter-regular text-sm mb-3">
              3 laporan baru menunggu peninjauan hari ini
            </Text>
            <Pressable className="bg-blue-50 rounded-xl py-2">
              <Text className="text-[#2431AE] text-center font-inter-semi-bold text-sm">
                Tinjau sekarang →
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
