import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import BackConfirmationModal from '@/components/back-confirmation-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function EditDraftDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

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
    typeof params.title === 'string' && params.title ? params.title : 'Nama kerusakan';

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
          Penanganan yang dilakukan <Text className="text-[#EB3030]">*</Text>
        </Text>
        <TextInput
          className="mb-5 rounded-xl border border-gray-200 px-4 py-4 font-inter-regular text-base text-gray-950"
          value={namaLaporan}
          onChangeText={setNamaLaporan}
          editable={true}
        />

        {/* Catatan */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">Catatan</Text>
        <TextInput
          className="mb-7 h-24 min-h-[131px] rounded-xl border border-gray-200 px-4 font-inter-regular text-gray-500"
          placeholder="Masukkan catatan tambahan terkait penanganan..."
          multiline
          textAlignVertical="top"
          value={catatan}
          onChangeText={setCatatan}
        />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between bg-transparent px-4 py-4">
        <Pressable
          className="ml-2 flex-1 rounded-full bg-[#1437B9] py-4"
          onPress={() => setShowConfirmModal(true)}>
          <Text className="text-center font-semibold text-white">Kirim</Text>
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
