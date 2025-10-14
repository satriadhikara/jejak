import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import BackConfirmationModal from '@/components/back-confirmation-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function EditDraftDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Prefill values if params exist, otherwise empty
  const [selectedKategori, setSelectedKategori] = useState(
    typeof params.kategori === 'string' ? params.kategori : ''
  );
  const [kategoriDropdownOpen, setKategoriDropdownOpen] = useState(false);
  const [adaDampak, setAdaDampak] = useState(
    typeof params.adaDampak === 'string' ? params.adaDampak : null
  );
  const [catatan, setCatatan] = useState(typeof params.catatan === 'string' ? params.catatan : '');
  const [imageUris, setImageUris] = useState(
    typeof params.imageUris === 'string' ? JSON.parse(params.imageUris) : []
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [namaLaporan, setNamaLaporan] = useState(
    typeof params.title === 'string' ? params.title : ''
  );

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
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUris((prev: string[]) => [
        ...prev,
        ...result.assets.map((asset: ImagePicker.ImagePickerAsset) => asset.uri),
      ]);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImageUris((prev: string[]) => prev.filter((item: string) => item !== uri));
  };

  useEffect(() => {
    if (selectedKategori || adaDampak || catatan || imageUris.length > 0) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [selectedKategori, adaDampak, catatan, imageUris]);

  const handleBack = () => {
    if (isDirty) {
      setShowBackConfirmModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmCancel = () => {
    setShowBackConfirmModal(false);
    router.back();
  };

  const headerText =
    typeof params.title === 'string' && params.title ? params.title : 'Laporan Kerusakan';

  const isBlank = !params.title;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <Text className="ml-3 font-inter-semi-bold text-lg text-gray-950">{headerText}</Text>
        </View>

        {isBlank && (
          <View className="mb-5 flex-row items-start gap-3 rounded-xl bg-[#EEF4FF] p-4">
            <FontAwesome name="exclamation-circle" size={20} color="#3739CC" />
            <View className="flex-1">
              <Text className="mb-1 font-inter-semi-bold text-sm text-[#3739CC]">
                Pastikan foto akurat
              </Text>
              <Text className="font-inter-regular text-xs text-[#3739CC]">
                Masukkan foto yang diambil dilokasi kejadian
              </Text>
            </View>
          </View>
        )}

        {/* Dokumentasi */}
        <Text className="mb-2 font-inter-medium text-sm text-gray-700">
          Dokumentasi <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-5 flex-row flex-wrap gap-4">
          {imageUris.map((uri: string) => (
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
          value={namaLaporan}
          onChangeText={setNamaLaporan}
          editable={true}
        />

        {/* Lokasi */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">
          Lokasi <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-inter-semi-bold text-base text-[#2A37D8]">
              {typeof params.location === 'string' ? params.location : 'Room 23 Merch Store'}
            </Text>
            <Text className="font-inter-regular text-sm text-gray-500">
              {/* You can add more location detail here if available */}
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
            <View className="flex-row items-center">
              <Text
                className={`font-inter-medium text-base ${selectedKategori ? 'text-gray-950' : 'text-gray-400'}`}>
                {selectedKategori
                  ? kategoriOptions.find((opt) => opt.value === selectedKategori)?.label
                  : 'Pilih kategori kerusakan'}
              </Text>
            </View>
            <Ionicons
              name={kategoriDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#717680"
            />
          </Pressable>
          {kategoriDropdownOpen && (
            <View className="rounded-b-xl border-t border-gray-100 bg-white">
              {kategoriOptions.map((opt, idx) => {
                const isSelected = selectedKategori === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    className={`flex-row items-center justify-between px-4 py-3 ${isSelected ? 'bg-gray-50' : ''}`}
                    onPress={() => {
                      setSelectedKategori(opt.value);
                      setKategoriDropdownOpen(false);
                    }}>
                    <View className="flex-row items-center">
                      {/* Individual colored circle for each option */}
                      <View
                        className={`mr-2 h-2 w-2 rounded-full ${
                          idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-orange-400' : 'bg-red-500'
                        }`}
                      />
                      <Text className="font-inter-medium text-base text-gray-950">{opt.label}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={23} color="#2A37D8" />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Dampak */}
        <Text className="mb-2 font-inter-medium text-sm text-gray-700">
          Apakah ada dampak dari kerusakan? <Text className="text-[#EB3030]">*</Text>
        </Text>
        <View className="mb-5">
          {['ya', 'tidak'].map((val) => {
            const isSelected = adaDampak === val;
            return (
              <View
                key={val}
                className={`mb-3 flex-row items-center rounded-xl border px-3 py-4 ${
                  isSelected ? 'border-[#2A37D8] bg-[#EBF4FF]' : 'border-gray-200'
                }`}>
                <Pressable
                  onPress={() => setAdaDampak(val)}
                  className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                  }`}>
                  {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                </Pressable>
                <Text
                  className={`font-inter-medium text-base ${
                    isSelected ? 'text-[#2A37D8]' : 'text-gray-700'
                  }`}>
                  {val === 'ya' ? 'Ya' : 'Tidak'}
                </Text>
              </View>
            );
          })}
        </View>

        {adaDampak === 'ya' && (
          <>
            <Text className="mb-1 font-inter-medium text-sm text-gray-700">
              Dampak Kerusakan <Text className="text-[#EB3030]">*</Text>
            </Text>
            <TextInput
              className="mb-5 rounded-xl border border-gray-200 px-4 py-4 font-inter-regular text-base text-gray-950"
              placeholder="Tuliskan dampak yang terjadi"
              value={catatan}
              onChangeText={setCatatan}
            />
          </>
        )}

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
        <Pressable
          className="ml-2 flex-1 rounded-full bg-[#1437B9] py-3"
          onPress={() => setShowConfirmModal(true)}>
          <Text className="text-center font-semibold text-white">Submit</Text>
        </Pressable>
      </View>

      {/* Modals */}
      <BackConfirmationModal
        visible={showBackConfirmModal}
        onCancel={() => setShowBackConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        title={isBlank ? 'Batalkan Laporan?' : 'Batalkan Perubahan?'}
        description={
          isBlank
            ? 'Dengan membatalkan, seluruh perubahan yang kamu buat akan terhapus permanen.'
            : 'Dengan membatalkan akan menghapus permanen seluruh perubahan yang telah kamu buat.'
        }
        cancelText="Kembali"
        confirmText="Batal"
      />

      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        title="Apakah kamu yakin?"
        description="Pastikan seluruh data kerusakan yang dimasukkan sudah benar sebelum dikirimkan."
        cancelText="Kembali"
        confirmText="Kirim"
      />
    </SafeAreaView>
  );
}
