import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ConfirmationModal from '@/components/riwayat/back-confirmation-modal';

export default function EditDraftDetail() {
  const [selectedKategori, setSelectedKategori] = useState('');
  const [kategoriDropdownOpen, setKategoriDropdownOpen] = useState(false);
  const [adaDampak, setAdaDampak] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const kategoriOptions = [
    { label: 'Ringan', value: 'ringan' },
    { label: 'Sedang', value: 'sedang' },
    { label: 'Berat', value: 'berat' },
  ];

  // Image picker handler
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true, // enable multi select
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUris((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImageUris((prev) => prev.filter((item) => item !== uri));
  };

  // Track changes to form fields
  useEffect(() => {
    if (
      selectedKategori ||
      adaDampak ||
      catatan ||
      imageUris.length > 0
      // add other fields if needed
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [selectedKategori, adaDampak, catatan, imageUris]);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Scrollable content */}
      <ScrollView
        className="px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <Text className="ml-3 font-inter-semi-bold text-lg text-gray-950">
            Kerusakan di Jl. Anggrek
          </Text>
        </View>

        {/* Dokumentasi */}
        <Text className="mb-2 font-inter-medium text-sm text-gray-700">
          Dokumentasi <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-5 flex-row flex-wrap gap-4">
          {imageUris.map((uri) => (
            <View key={uri} className="relative h-20 w-20">
              <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
              <Pressable
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1"
                onPress={() => handleRemoveImage(uri)}>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Pressable
            className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300"
            onPress={handlePickImage}>
            <MaterialIcons name="add-photo-alternate" size={26} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Nama Laporan */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">
          Nama Laporan <Text className="text-[#EB3030]">*</Text>
        </Text>
        <TextInput
          className="mb-5 rounded-xl border border-gray-200 px-4 py-4 font-inter-regular text-base text-gray-950"
          placeholder="Kerusakan di Jl. Anggrek"
          defaultValue="Kerusakan di Jl. Anggrek"
        />

        {/* Lokasi */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">
          Lokasi <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-inter-semi-bold text-base text-[#2A37D8]">
              Room 23 Merch Store
            </Text>
            <Text className="font-inter-regular text-sm text-gray-500">
              Jl. Anggrek No.34, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113
            </Text>
          </View>

          <Pressable onPress={() => console.log('Edit location pressed')} className="ml-3 mt-1">
            <FontAwesome5 name="edit" size={20} color="#9CA3AF" />
          </Pressable>
        </View>
        <Image
          source={require('@/assets/maps-mock.png')}
          className="mb-5 h-40 w-full rounded-2xl"
        />

        {/* Kategori kerusakan as dropdown */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">
          Kategori kerusakan <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-5 rounded-xl border border-gray-200">
          <Pressable
            className="h-14 flex-row items-center justify-between px-4"
            onPress={() => setKategoriDropdownOpen((open) => !open)}>
            <Text className={`text-base ${selectedKategori ? 'text-gray-900' : 'text-gray-400'}`}>
              {selectedKategori
                ? kategoriOptions.find((opt) => opt.value === selectedKategori)?.label
                : 'Pilih kategori kerusakan'}
            </Text>
            <Ionicons
              name={kategoriDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#717680"
            />
          </Pressable>
          {kategoriDropdownOpen && (
            <View className="rounded-b-xl border-t border-gray-100 bg-white">
              {kategoriOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  className="px-4 py-3"
                  onPress={() => {
                    setSelectedKategori(opt.value);
                    setKategoriDropdownOpen(false);
                  }}>
                  <Text
                    className={`text-base ${
                      selectedKategori === opt.value ? 'font-bold text-blue-600' : 'text-gray-700'
                    }`}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Dampak */}
        <Text className="mb-2 font-inter-medium text-sm text-gray-700">
          Apakah ada dampak dari kerusakan? <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-5">
          {['ya', 'tidak'].map((val) => (
            <View
              key={val}
              className="mb-3 flex-row items-center rounded-xl border border-gray-200 px-3 py-4">
              <Pressable
                onPress={() => setAdaDampak(val)}
                className="mr-2 h-4 w-4 items-center justify-center rounded border border-gray-400">
                {adaDampak === val && <View className="h-4 w-4 rounded bg-blue-600" />}
              </Pressable>
              <Text
                className={`font-inter-medium text-base ${
                  adaDampak === val ? 'text-blue-600' : 'text-gray-700'
                }`}>
                {val === 'ya' ? 'Ya' : 'Tidak'}
              </Text>
            </View>
          ))}
        </View>

        {/* Catatan */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">Catatan</Text>
        <TextInput
          className="mb-7 h-24 min-h-[131px] rounded-xl border border-gray-200 px-4 font-inter-regular text-gray-500"
          placeholder="Masukkan catatan tambahan terkait kerusakan..."
          multiline
          textAlignVertical="top"
          value={catatan}
          onChangeText={setCatatan}
        />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between bg-transparent px-4 py-4">
        <Pressable className="mr-2 flex-1 rounded-full border border-gray-300 bg-gray-50 py-3">
          <Text className="text-center font-semibold text-gray-700">Save as Draft</Text>
        </Pressable>
        <Pressable className="ml-2 flex-1 rounded-full bg-[#1437B9] py-3">
          <Text className="text-center font-semibold text-white">Submit</Text>
        </Pressable>
      </View>

      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}
