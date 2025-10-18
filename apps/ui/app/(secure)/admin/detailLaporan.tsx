import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DropdownStatus from '@/components/admin/dropdown-status';
import ConfirmationModal from '@/components/confirmation-modal';

export default function DetailRiwayat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#FAFAFB] pb-2">
      <ScrollView
        className="px-4 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header */}
        <View className="flex-row items-center px-3 py-5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
          <Text className="ml-3 font-inter-semi-bold text-lg text-[#242528]">Detail Laporan</Text>
        </View>

        {/* Title and date */}
        <Text className="mb-1 mt-2 font-inter-semi-bold text-xl">
          Kerusakan Trotoar ITB Ganesha
        </Text>
        <Text className="mb-5 font-inter-regular text-sm text-gray-400">
          3 Oktober 2025 • 13:44 WIB
        </Text>

        {/* Images */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-7">
          <Image
            source={require('@/assets/laporan-mock.png')}
            className="mr-2 h-44 w-44 rounded-xl"
          />
          <Image
            source={require('@/assets/laporan-mock.png')}
            className="mr-2 h-44 w-44 rounded-xl"
          />
          <Image
            source={require('@/assets/laporan-mock.png')}
            className="mr-2 h-44 w-44 rounded-xl"
          />
          <Image source={require('@/assets/laporan-mock.png')} className="h-44 w-44 rounded-xl" />
        </ScrollView>

        {/* Detail Laporan */}
        <Text className="mb-2 font-inter-bold text-sm text-[#2431AE]">Detail Laporan</Text>

        <View className="gap-3">
          <View className="gap-1">
            <Text className="font-inter-semi-bold text-xs text-gray-300">Lokasi: </Text>
            <Text className="font-inter-regular text-sm text-[#242528]">
              Jl. Ganesa No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132
            </Text>
          </View>

          {/* Map */}
          <View className="mt-2 h-40 overflow-hidden rounded-xl">
            <Image
              source={require('@/assets/maps-mock.png')}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          <View className="gap-1">
            <Text className="font-inter-semi-bold text-xs text-gray-300">Kategori kerusakan: </Text>
            <Text className="font-inter-regular text-sm text-[#242528]">Berat</Text>
          </View>
          <View className="gap-1">
            <Text className="font-inter-semi-bold text-xs text-gray-300">Dampak kerusakan: </Text>
            <Text className="font-inter-regular text-sm text-[#242528]">
              Pejalan kaki dapat tersandung
            </Text>
          </View>

          <View className="gap-1">
            <Text className="font-inter-semi-bold text-xs text-gray-300">Catatan: </Text>
            <Text className="font-inter-regular text-sm text-[#242528]">
              Kerusakan cukup parah pada jalur trotoar di depan gerbang utama ITB. Permukaan
              bergelombang dan beberapa bagian terangkat, berpotensi menyebabkan pejalan kaki
              tersandung. Diharapkan perbaikan segera selesai sebelum akhir minggu untuk menjaga
              keamanan pengguna jalan.
            </Text>
          </View>

          {/* Dropdown Section */}
          <DropdownStatus isOpen={isOpen} setIsOpen={setIsOpen} />
        </View>

        <Pressable
          className="mx-1 mb-4 rounded-full bg-[#2431AE] px-5 py-4"
          onPress={() => setShowConfirmModal(true)}>
          <Text className="text-center font-inter-semi-bold text-base text-[#F5F5F6]">
            Konfirmasi Laporan
          </Text>
        </Pressable>

        <Pressable
          className="mx-1 mb-4 rounded-full bg-[#2431AE] px-5 py-4"
          onPress={() => router.push('/(secure)/admin/laporanComplete')}>
          <Text className="text-center font-inter-semi-bold text-base text-[#F5F5F6]">
            Laporkan Penyelesaian
          </Text>
        </Pressable>

        {/* <Pressable className="mx-1 mb-4 rounded-full bg-[#CED0D3] px-5 py-4">
          <Text className="text-center font-inter-semi-bold text-base text-[#717680]">
            Laporkan Penyelesaian
          </Text>
        </Pressable> */}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
        }}
        title="Apakah kamu yakin?"
        description="Kamu tidak dapat membatalkan tindakan ini setelah laporan dikonfirmasi. Harap pastikan laporan sudah valid."
        cancelText="Kembali"
        confirmText="Ya"
      />
    </View>
  );
}
