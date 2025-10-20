import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackConfirmationModal from '@/components/back-confirmation-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { File as ExpoFile, Paths } from 'expo-file-system';
import { useAuthContext } from '@/lib/auth-context';
import { useLocationContext } from '@/lib/location-context';
import {
  createReport,
  updateReport,
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
import {
  ImageDocumentation,
  KategoriDropdown,
  LocationSelector,
  DamageImpactSection,
  FormFooterButtons,
} from '@/components/edit-draft-detail';

type SubmitStatus = Extract<ReportStatus, 'draft' | 'diperiksa'>;

export default function EditDraftDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { cookies } = useAuthContext();
  const { selectedLocation } = useLocationContext();

  const reportId = typeof params.id === 'string' ? params.id : null;

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
  const [impactDamage, setImpactDamage] = useState(
    typeof params.impactDamage === 'string' ? params.impactDamage : ''
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

  const DEFAULT_LOCATION_GEO = selectedLocation
    ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
    : { lat: -6.914744, lng: 107.60981 };
  const locationName = selectedLocation
    ? selectedLocation.mainText
    : typeof params.location === 'string' && params.location.length > 0
      ? params.location
      : 'Lokasi belum ditentukan';

  const queryClient = useQueryClient();
  const createReportMutation = useMutation({
    mutationFn: async ({ cookie, payload }: { cookie: string; payload: CreateReportPayload }) => {
      if (reportId) {
        return updateReport(cookie, reportId, payload);
      }
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
      impactDamage ||
      imageUris.length > 0 ||
      namaLaporan.trim().length > 0
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [selectedKategori, adaDampak, catatan, impactDamage, imageUris, namaLaporan]);

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

    if (adaDampak === 'ya' && !impactDamage.trim()) {
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
      const trimmedImpact = impactDamage.trim();
      const payload: CreateReportPayload = {
        title: namaLaporan.trim(),
        locationName,
        locationGeo: DEFAULT_LOCATION_GEO,
        damageCategory: selectedKategori as DamageCategory,
        photosUrls,
        status,
        statusHistory,
      };

      if (adaDampak === 'ya' && trimmedImpact) {
        payload.impactOfDamage = trimmedImpact;
      }

      if (trimmedNotes) {
        payload.description = trimmedNotes;
      }

      await createReportMutation.mutateAsync({ cookie: cookieHeader, payload });

      Alert.alert(
        status === 'draft' ? 'Draft tersimpan' : 'Laporan terkirim',
        status === 'draft'
          ? reportId
            ? 'Draft berhasil diperbarui.'
            : 'Laporan berhasil disimpan sebagai draft.'
          : reportId
            ? 'Perubahan laporan berhasil dikirim untuk diperiksa.'
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

  const isBlank = !params.title && !reportId;

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
        <ImageDocumentation
          imageUris={imageUris}
          onRemoveImage={handleRemoveImage}
          onAddImage={appendImageUris}
          isSubmitting={isSubmitting}
        />

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
        <LocationSelector selectedLocation={selectedLocation} />

        {/* Kategori kerusakan as dropdown */}
        <Text className="mb-1 font-inter-medium text-sm text-gray-700">
          Kategori kerusakan <Text className="text-[#EB3030]">*</Text>
        </Text>
        <KategoriDropdown
          selectedKategori={selectedKategori}
          kategoriDropdownOpen={kategoriDropdownOpen}
          onToggleDropdown={() => setKategoriDropdownOpen((open) => !open)}
          onSelectKategori={(value) => {
            setSelectedKategori(value);
            setKategoriDropdownOpen(false);
          }}
        />

        {/* Damage Impact and Notes Section */}
        <DamageImpactSection
          adaDampak={adaDampak}
          impactDamage={impactDamage}
          catatan={catatan}
          onAdaDampakChange={setAdaDampak}
          onImpactDamageChange={setImpactDamage}
          onCatatanChange={setCatatan}
        />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <FormFooterButtons
        isSubmitting={isSubmitting}
        pendingStatus={pendingStatus}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitPress}
      />

      {/* Modals */}
      <BackConfirmationModal
        visible={showBackConfirmModal}
        onCancel={() => setShowBackConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        title={
          isBlank ? 'Batalkan Laporan?' : reportId ? 'Batalkan Perubahan?' : 'Batalkan Perubahan?'
        }
        description={
          isBlank
            ? 'Dengan membatalkan, seluruh perubahan yang kamu buat akan terhapus permanen.'
            : reportId
              ? 'Perubahan yang telah kamu buat tidak akan disimpan.'
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
