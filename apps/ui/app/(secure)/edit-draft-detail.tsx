import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import BackConfirmationModal from '@/components/back-confirmation-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
// import * as FileSystem from "expo-file-system";
import { File as ExpoFile, Paths } from 'expo-file-system';
import { useAuthContext } from '@/lib/auth-context';
import {
  createReport,
  getStorageUploadUrl,
  type CreateReportPayload,
} from '@/utils/api/riwayat.api';
import type {
  DamageCategory,
  PhotoUrl,
  ReportStatus,
  StatusHistoryEntry,
} from '@/utils/types/riwayat.types';
import { SafeAreaView } from 'react-native-safe-area-context';

type SubmitStatus = Extract<ReportStatus, 'draft' | 'diperiksa'>;

export default function EditDraftDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cookies } = useAuthContext();

  const parseInitialImageUris = () => {
    if (typeof params.imageUris !== 'string') {
      return [] as string[];
    }

    try {
      const parsed = JSON.parse(params.imageUris);
      if (Array.isArray(parsed)) {
        return parsed.filter((uri): uri is string => typeof uri === 'string');
      }
    } catch (error) {
      console.warn('Failed to parse image URIs from params', error);
    }

    return [] as string[];
  };

  // Prefill values if params exist, otherwise empty
  const [selectedKategori, setSelectedKategori] = useState(
    typeof params.kategori === 'string' ? params.kategori : ''
  );
  const [kategoriDropdownOpen, setKategoriDropdownOpen] = useState(false);
  const [adaDampak, setAdaDampak] = useState(
    typeof params.adaDampak === 'string' ? params.adaDampak : null
  );
  const [catatan, setCatatan] = useState(typeof params.catatan === 'string' ? params.catatan : '');
  const [imageUris, setImageUris] = useState<string[]>(parseInitialImageUris);
  const [isDirty, setIsDirty] = useState(false);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [namaLaporan, setNamaLaporan] = useState(
    typeof params.title === 'string' ? params.title : ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<SubmitStatus | null>(null);

  const kategoriOptions = [
    { label: 'Ringan', value: 'ringan' },
    { label: 'Sedang', value: 'sedang' },
    { label: 'Berat', value: 'berat' },
  ];
  const locationName =
    typeof params.location === 'string' && params.location.length > 0
      ? params.location
      : 'Lokasi belum ditentukan';
  const DEFAULT_LOCATION_GEO = { lat: -6.914744, lng: 107.60981 }; // Placeholder until maps integration

  const queryClient = useQueryClient();
  const createReportMutation = useMutation({
    mutationFn: async ({ cookie, payload }: { cookie: string; payload: CreateReportPayload }) => {
      return createReport(cookie, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['userReports'] });
    },
  });
  const isSubmitting = isUploading || createReportMutation.isPending;

  const appendImageUris = (uris: string[]) => {
    if (!uris.length) {
      return;
    }

    setImageUris((prev) => {
      const combined = [...prev, ...uris];
      return Array.from(new Set(combined));
    });
  };

  // Image picker handler
  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets
        .map((asset) => asset.uri)
        .filter((uri): uri is string => typeof uri === 'string');
      appendImageUris(uris);
    }
  };

  const handlePickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Kamera Diperlukan',
        'Aktifkan akses kamera agar kamu bisa mengambil dokumentasi langsung dari kamera.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets
        .map((asset) => asset.uri)
        .filter((uri): uri is string => typeof uri === 'string');
      appendImageUris(uris);
    }
  };

  const handleAddImage = () => {
    if (isSubmitting) {
      return;
    }
    Alert.alert('Tambah Dokumentasi', 'Pilih sumber gambar', [
      { text: 'Kamera', onPress: handlePickFromCamera },
      { text: 'Galeri', onPress: handlePickFromLibrary },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = (uri: string) => {
    if (isSubmitting) {
      return;
    }
    setImageUris((prev: string[]) => prev.filter((item: string) => item !== uri));
  };

  useEffect(() => {
    if (
      selectedKategori ||
      adaDampak ||
      catatan ||
      imageUris.length > 0 ||
      namaLaporan.trim().length > 0
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [selectedKategori, adaDampak, catatan, imageUris, namaLaporan]);

  const validateForm = (status: SubmitStatus) => {
    if (!namaLaporan.trim()) {
      Alert.alert('Nama laporan wajib diisi', 'Masukkan judul laporan sebelum melanjutkan.');
      return false;
    }

    if (!selectedKategori) {
      Alert.alert('Kategori wajib dipilih', 'Pilih kategori kerusakan terlebih dahulu.');
      return false;
    }

    if (!adaDampak) {
      Alert.alert('Pilih dampak kerusakan', 'Tentukan apakah kerusakan menimbulkan dampak.');
      return false;
    }

    if (adaDampak === 'ya' && !catatan.trim()) {
      Alert.alert('Isi dampak kerusakan', 'Jelaskan dampak dari kerusakan yang ditemukan.');
      return false;
    }

    if (status === 'diperiksa' && imageUris.length === 0) {
      Alert.alert(
        'Dokumentasi diperlukan',
        'Tambahkan minimal satu foto sebelum mengirim laporan.'
      );
      return false;
    }

    return true;
  };

  const buildFileName = (uri: string, index: number) => {
    const cleaned = uri.split('?')[0];
    const candidate = cleaned.split('/').pop();
    if (candidate && /\.[a-zA-Z0-9]+$/.test(candidate)) {
      return candidate;
    }
    return `report-photo-${Date.now()}-${index}.jpg`;
  };

  const uploadImages = async (cookieHeader: string): Promise<PhotoUrl[]> => {
    if (imageUris.length === 0) {
      return [];
    }

    const uploads: PhotoUrl[] = [];

    for (let index = 0; index < imageUris.length; index += 1) {
      const uri = imageUris[index];
      if (!uri) continue;

      let uploadFile: ExpoFile;
      let shouldCleanup = false;

      if (uri.startsWith('http')) {
        // Download remote image to cache first
        const { fetch: expoFetch } = await import('expo/fetch');
        const tempFileName = `report-${Date.now()}-${index}.jpg`;
        const response = await expoFetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const tempFile = new ExpoFile(Paths.cache, tempFileName);
        tempFile.write(bytes, {});
        uploadFile = tempFile;
        shouldCleanup = true;
      } else {
        // Create File instance from local URI
        uploadFile = new ExpoFile(uri);
      }

      if (!uploadFile.exists) {
        throw new Error(`File not found at ${uploadFile.uri}`);
      }

      const fileName = buildFileName(uri, index);
      const { url, key, contentType } = await getStorageUploadUrl(cookieHeader, fileName);

      // Use expo/fetch to upload the file
      const { fetch } = await import('expo/fetch');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: uploadFile as unknown as BodyInit,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      uploads.push({ key });

      // Cleanup temporary file if needed
      if (shouldCleanup) {
        try {
          uploadFile.delete();
        } catch {
          // Ignore cleanup errors
        }
      }
    }

    return uploads;
  };

  const handleSubmitReport = async (status: SubmitStatus) => {
    setPendingStatus(status);
    const cookieHeader = typeof cookies === 'string' ? cookies : '';

    if (!cookieHeader) {
      Alert.alert('Sesi tidak ditemukan', 'Silakan masuk kembali sebelum mengirim laporan.');
      setPendingStatus(null);
      return;
    }

    setIsUploading(true);

    try {
      const photosUrls = await uploadImages(cookieHeader);
      const now = new Date().toISOString();
      const statusHistory: StatusHistoryEntry[] = [
        {
          status: 'draft',
          timestamp: now,
          description: 'Laporan dibuat oleh pengguna.',
        },
      ];

      if (status !== 'draft') {
        statusHistory.push({
          status,
          timestamp: now,
          description: 'Laporan dikirim untuk diperiksa.',
        });
      }

      const trimmedNotes = catatan.trim();
      const payload: CreateReportPayload = {
        title: namaLaporan.trim(),
        locationName,
        locationGeo: DEFAULT_LOCATION_GEO,
        damageCategory: selectedKategori as DamageCategory,
        photosUrls,
        status,
        statusHistory,
      };

      if (adaDampak === 'ya' && trimmedNotes) {
        payload.impactOfDamage = trimmedNotes;
      }

      if (trimmedNotes) {
        payload.description = trimmedNotes;
      }

      await createReportMutation.mutateAsync({ cookie: cookieHeader, payload });

      Alert.alert(
        status === 'draft' ? 'Draft tersimpan' : 'Laporan terkirim',
        status === 'draft'
          ? 'Laporan berhasil disimpan sebagai draft.'
          : 'Laporan berhasil dikirim untuk diperiksa.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(secure)/(tabs)/riwayat'),
          },
        ]
      );
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to submit report', error);
      Alert.alert(
        'Gagal mengirim laporan',
        'Terjadi kesalahan saat memproses laporan. Silakan coba lagi.'
      );
    } finally {
      setIsUploading(false);
      setPendingStatus(null);
    }
  };

  const handleSaveDraft = () => {
    if (!validateForm('draft')) {
      return;
    }
    void handleSubmitReport('draft');
  };

  const handleSubmitPress = () => {
    if (!validateForm('diperiksa')) {
      return;
    }
    setPendingStatus('diperiksa');
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingStatus) {
      return;
    }
    setShowConfirmModal(false);
    void handleSubmitReport(pendingStatus);
  };

  const handleCancelSubmitModal = () => {
    setPendingStatus(null);
    setShowConfirmModal(false);
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
          <Pressable
            onPress={handleBack}
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-40' : undefined}>
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
            onPress={handleAddImage}>
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
            <Text className="font-inter-semi-bold text-base text-[#2A37D8]">{locationName}</Text>
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
                className={`font-inter-medium text-base ${
                  selectedKategori ? 'text-gray-950' : 'text-gray-400'
                }`}>
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
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      isSelected ? 'bg-gray-50' : ''
                    }`}
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
        <Pressable
          disabled={isSubmitting}
          onPress={handleSaveDraft}
          className={`mr-2 flex-1 rounded-full border border-gray-300 bg-gray-50 py-3 ${
            isSubmitting ? 'opacity-50' : ''
          }`}>
          <Text className="text-center font-semibold text-gray-700">
            {isSubmitting && pendingStatus === 'draft' ? 'Menyimpan...' : 'Save as Draft'}
          </Text>
        </Pressable>
        <Pressable
          disabled={isSubmitting}
          className={`ml-2 flex-1 rounded-full bg-[#1437B9] py-3 ${
            isSubmitting ? 'opacity-50' : ''
          }`}
          onPress={handleSubmitPress}>
          <Text className="text-center font-semibold text-white">
            {isSubmitting && pendingStatus === 'diperiksa' ? 'Mengirim...' : 'Submit'}
          </Text>
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
        onCancel={handleCancelSubmitModal}
        onConfirm={handleConfirmSubmit}
        title="Kirim laporan sekarang?"
        description="Pastikan seluruh data kerusakan yang dimasukkan sudah benar sebelum dikirimkan."
        cancelText="Kembali"
        confirmText="Kirim"
      />

      {isSubmitting && (
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <ActivityIndicator size="large" color="#1437B9" />
        </View>
      )}
    </SafeAreaView>
  );
}
