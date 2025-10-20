import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import BackConfirmationModal from '@/components/back-confirmation-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminReportById, completeReport } from '@/utils/api/admin.api';
import { getStorageUploadUrl } from '@/utils/api/riwayat.api';

export default function LaporanComplete() {
  const { reportId } = useLocalSearchParams();
  const router = useRouter();
  const { cookies } = useAuthContext();
  const queryClient = useQueryClient();

  const [handlingDescription, setHandlingDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const reportIdString = useMemo(() => {
    if (!reportId) return null;
    return Array.isArray(reportId) ? reportId[0] : reportId;
  }, [reportId]);

  // Fetch report details to show title
  const reportQuery = useQuery({
    queryKey: ['adminReportDetail', reportIdString, cookies],
    queryFn: () => getAdminReportById(cookies ?? '', reportIdString ?? ''),
    enabled: Boolean(cookies) && Boolean(reportIdString),
  });

  const report = reportQuery.data?.data ?? null;

  // Track dirty state
  React.useEffect(() => {
    setIsDirty(
      handlingDescription.trim().length > 0 || notes.trim().length > 0 || imageUris.length > 0
    );
  }, [handlingDescription, notes, imageUris]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUris((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImageUris((prev) => prev.filter((item) => item !== uri));
  };

  const handleBack = () => {
    if (isDirty) {
      setShowBackConfirmModal(true);
    } else {
      router.back();
    }
  };

  const handleCancelChanges = () => {
    setShowBackConfirmModal(false);
    router.back();
  };

  // Upload images to S3
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Get file info
      const fileName = uri.split('/').pop() || 'image.jpg';

      // Get presigned URL
      const { url, key } = await getStorageUploadUrl(cookies ?? '', fileName);

      // Upload file
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      return key;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!reportIdString || !report) throw new Error('Report not found');

      // Validate
      if (imageUris.length === 0) {
        throw new Error('Minimal satu foto dokumentasi harus diupload');
      }
      if (handlingDescription.trim().length === 0) {
        throw new Error('Deskripsi penanganan harus diisi');
      }

      // Upload all images
      const uploadedKeys = await Promise.all(imageUris.map((uri) => uploadImage(uri)));

      // Create completion
      return completeReport(cookies ?? '', reportIdString, {
        handlingDescription: handlingDescription.trim(),
        notes: notes.trim() || undefined,
        completionImages: uploadedKeys.map((key) => ({ key })),
      });
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['adminReportDetail', reportIdString] });
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminInProgressReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminCompletedReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });

      // Navigate to completed reports page
      router.replace('/(secure)/admin/laporanDone');
    },
    onError: (error) => {
      console.error('Error completing report:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim laporan');
    },
  });

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    completeMutation.mutate();
  };

  const isValid = imageUris.length > 0 && handlingDescription.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={handleBack} disabled={completeMutation.isPending}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </Pressable>
          <Text className="ml-3 font-inter-semi-bold text-lg text-gray-950">
            {report?.title || 'Laporan Penyelesaian'}
          </Text>
        </View>

        {reportQuery.isPending ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="small" color="#1859F8" />
            <Text className="mt-3 font-inter-regular text-sm text-gray-500">
              Memuat data laporan...
            </Text>
          </View>
        ) : (
          <>
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
                    onPress={() => handleRemoveImage(uri)}
                    disabled={completeMutation.isPending}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </Pressable>
                </View>
              ))}
              <Pressable
                className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300"
                onPress={handlePickImage}
                disabled={completeMutation.isPending}>
                <MaterialIcons name="add-photo-alternate" size={26} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Penanganan yang dilakukan */}
            <Text className="mb-1 font-inter-medium text-sm text-gray-700">
              Penanganan yang dilakukan <Text className="text-[#EB3030]">*</Text>
            </Text>
            <TextInput
              className="mb-5 rounded-xl border border-gray-200 px-4 py-4 font-inter-regular text-base text-gray-950"
              placeholder="Deskripsikan tindakan yang telah dilakukan..."
              value={handlingDescription}
              onChangeText={setHandlingDescription}
              editable={!completeMutation.isPending}
            />

            {/* Catatan */}
            <Text className="mb-1 font-inter-medium text-sm text-gray-700">Catatan</Text>
            <TextInput
              className="mb-7 h-24 min-h-[131px] rounded-xl border border-gray-200 px-4 font-inter-regular text-gray-500"
              placeholder="Masukkan catatan tambahan terkait penanganan..."
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              editable={!completeMutation.isPending}
            />
          </>
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-5 left-0 right-0 flex-row justify-between bg-transparent px-4 py-4">
        <Pressable
          className={`ml-2 flex-1 rounded-full py-4 ${
            isValid && !completeMutation.isPending ? 'bg-[#1437B9]' : 'bg-gray-300'
          }`}
          onPress={() => setShowConfirmModal(true)}
          disabled={!isValid || completeMutation.isPending}>
          {completeMutation.isPending ? (
            <ActivityIndicator size="small" color="#F5F5F6" />
          ) : (
            <Text className="text-center font-semibold text-white">Kirim</Text>
          )}
        </Pressable>
      </View>

      {/* Modals */}
      <BackConfirmationModal
        visible={showBackConfirmModal}
        onCancel={() => setShowBackConfirmModal(false)}
        onConfirm={handleCancelChanges}
        title="Batalkan Perubahan?"
        description="Dengan membatalkan akan menghapus permanen seluruh perubahan yang telah kamu buat."
        cancelText="Kembali"
        confirmText="Batal"
      />

      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Apakah kamu yakin?"
        description="Pastikan seluruh data penanganan yang dimasukkan sudah benar sebelum dikirimkan. Pelapor akan mendapat 15 poin setelah laporan selesai."
        cancelText="Kembali"
        confirmText="Kirim"
      />
    </SafeAreaView>
  );
}
