import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropdownStatus from '@/components/admin/dropdown-status';
import ConfirmationModal from '@/components/confirmation-modal';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminReportById, updateReportStatus } from '@/utils/api/admin.api';
import { getStorageReadUrl } from '@/utils/api/riwayat.api';
import { GoogleMaps } from 'expo-maps';
import type { StatusHistoryEntry } from '@/utils/types/admin.types';

const MODAL_HORIZONTAL_PADDING = 24;

const SEVERITY_DISPLAY: Record<'berat' | 'sedang' | 'ringan', string> = {
  berat: 'Berat',
  sedang: 'Sedang',
  ringan: 'Ringan',
};

const formatCreatedAt = (value?: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function DetailRiwayat() {
  const { reportId } = useLocalSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const { cookies } = useAuthContext();
  const queryClient = useQueryClient();
  const windowDimensions = useWindowDimensions();

  const reportIdString = useMemo(() => {
    if (!reportId) return null;
    return Array.isArray(reportId) ? reportId[0] : reportId;
  }, [reportId]);

  const reportQuery = useQuery({
    queryKey: ['adminReportDetail', reportIdString, cookies],
    queryFn: () => getAdminReportById(cookies ?? '', reportIdString ?? ''),
    enabled: Boolean(cookies) && Boolean(reportIdString),
  });

  const report = reportQuery.data?.data ?? null;

  const formattedCreatedAt = useMemo(() => formatCreatedAt(report?.createdAt), [report?.createdAt]);

  const photoKeys = useMemo(() => {
    if (!report?.photosUrls?.length) {
      return [];
    }

    return report.photosUrls.map((item) => item.key).filter((key): key is string => Boolean(key));
  }, [report?.photosUrls]);

  const photosQuery = useQuery({
    queryKey: ['adminReportPhotos', reportIdString, photoKeys.join('|')],
    queryFn: async () => {
      const results: { key: string; url: string }[] = [];

      for (const key of photoKeys) {
        try {
          const { url } = await getStorageReadUrl(cookies ?? '', key);
          results.push({ key, url });
        } catch (error) {
          console.warn('Failed to load report photo', { key, error });
        }
      }

      if (!results.length) {
        throw new Error('Foto laporan tidak dapat dimuat.');
      }

      return results;
    },
    enabled: Boolean(cookies) && Boolean(reportIdString) && photoKeys.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  const photoData = photosQuery.data ?? [];
  const photosErrorMessage =
    photosQuery.error instanceof Error
      ? photosQuery.error.message
      : 'Terjadi kesalahan saat memuat foto laporan.';

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      newStatus,
      description,
    }: {
      newStatus: 'dikonfirmasi' | 'selesai';
      description: string;
    }) => {
      if (!reportIdString || !report) throw new Error('Report not found');

      const newHistory: StatusHistoryEntry[] = [
        ...(report.statusHistory || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          description,
        },
      ];

      return updateReportStatus(cookies ?? '', reportIdString, {
        status: newStatus,
        statusHistory: newHistory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReportDetail', reportIdString] });
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminNewReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminInProgressReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminCompletedReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const handleConfirmReport = () => {
    updateStatusMutation.mutate(
      {
        newStatus: 'dikonfirmasi',
        description: 'Laporan dikonfirmasi oleh admin',
      },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          router.back();
        },
      }
    );
  };

  const handleCompleteReport = () => {
    updateStatusMutation.mutate(
      {
        newStatus: 'selesai',
        description: 'Penyelesaian laporan dikonfirmasi oleh admin',
      },
      {
        onSuccess: () => {
          setShowCompleteModal(false);
          router.back();
        },
      }
    );
  };

  const handleClosePreview = () => setPreviewImage(null);
  const modalImageWidth = windowDimensions.width - MODAL_HORIZONTAL_PADDING * 2;
  const modalImageHeight = windowDimensions.height * 0.6;

  const showConfirmButton = report?.status === 'diperiksa';
  const showCompleteButton = report?.status === 'dalam_penanganan';

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

        {!reportIdString ? (
          <Text className="font-inter-medium text-base text-[#B42318]">
            Laporan tidak ditemukan. Pastikan tautan yang digunakan sudah benar.
          </Text>
        ) : reportQuery.isPending ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="small" color="#1859F8" />
            <Text className="mt-3 font-inter-regular text-sm text-gray-500">
              Memuat detail laporan...
            </Text>
          </View>
        ) : reportQuery.isError ? (
          <Text className="font-inter-medium text-base text-[#B42318]">
            {(reportQuery.error instanceof Error && reportQuery.error.message) ||
              'Terjadi kesalahan saat memuat detail laporan.'}
          </Text>
        ) : !report ? (
          <Text className="font-inter-medium text-base text-gray-600">
            Detail laporan tidak tersedia.
          </Text>
        ) : (
          <>
            {/* Title and date */}
            <Text className="mb-1 mt-2 font-inter-semi-bold text-xl">{report.title}</Text>
            <Text className="mb-5 font-inter-regular text-sm text-gray-400">
              {formattedCreatedAt}
            </Text>

            {/* Reporter Info */}
            <View className="mb-5 flex-row items-center rounded-xl border border-[#E5E6E8] bg-white p-3">
              {report.reporterImage ? (
                <Image
                  source={{ uri: report.reporterImage }}
                  className="h-10 w-10 rounded-full mr-3"
                />
              ) : (
                <View className="h-10 w-10 rounded-full mr-3 bg-gray-300" />
              )}
              <View>
                <Text className="font-inter-regular text-xs text-gray-400">Dilaporkan oleh</Text>
                <Text className="font-inter-semi-bold text-sm text-[#242528]">
                  {report.reporterName}
                </Text>
              </View>
            </View>

            {/* Images */}
            <View className="mb-7">
              {photoKeys.length === 0 ? (
                <View className="items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-[#F5F5F6] px-6 py-10">
                  <Text className="text-center font-inter-medium text-sm text-gray-500">
                    Laporan ini belum memiliki foto.
                  </Text>
                </View>
              ) : photosQuery.isPending ? (
                <View className="items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-10">
                  <ActivityIndicator size="small" color="#1859F8" />
                  <Text className="mt-3 text-center font-inter-regular text-xs text-gray-500">
                    Memuat foto laporan...
                  </Text>
                </View>
              ) : photosQuery.isError ? (
                <View className="items-center justify-center rounded-2xl border border-[#F9C6C6] bg-[#FFF5F5] px-6 py-6">
                  <Text className="text-center font-inter-medium text-sm text-[#B42318]">
                    {photosErrorMessage}
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photoData.map(({ key, url }) => (
                    <Pressable key={key} onPress={() => setPreviewImage(url)} className="mr-3">
                      <Image source={{ uri: url }} className="h-44 w-44 rounded-xl bg-[#E5E6E8]" />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Dropdown Section */}
            <DropdownStatus
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              statusHistory={report.statusHistory}
              currentStatus={report.status}
            />

            {/* Detail Laporan */}
            <Text className="mb-2 font-inter-bold text-sm text-[#2431AE]">Detail Laporan</Text>

            <View className="gap-3">
              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">Lokasi: </Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.locationName}
                </Text>
              </View>

              {/* Map */}
              <GoogleMaps.View
                style={{ height: 200, width: '100%' }}
                cameraPosition={{
                  coordinates: {
                    latitude: report.locationGeo.lat,
                    longitude: report.locationGeo.lng,
                  },
                  zoom: 17,
                }}
                uiSettings={{
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                  scrollGesturesEnabled: false,
                  zoomGesturesEnabled: false,
                  tiltGesturesEnabled: false,
                  rotationGesturesEnabled: false,
                }}
                markers={[
                  {
                    coordinates: {
                      latitude: report.locationGeo.lat,
                      longitude: report.locationGeo.lng,
                    },
                    title: report.locationName,
                  },
                ]}
              />

              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">
                  Kategori kerusakan:{' '}
                </Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {SEVERITY_DISPLAY[report.damageCategory]}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">
                  Dampak kerusakan:{' '}
                </Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.impactOfDamage || 'Tidak ada informasi dampak.'}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">Catatan: </Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.description || 'Tidak ada catatan tambahan.'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {showConfirmButton && (
              <Pressable
                className="mx-1 mb-4 mt-6 rounded-full bg-[#2431AE] px-5 py-4"
                onPress={() => setShowConfirmModal(true)}
                disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? (
                  <ActivityIndicator size="small" color="#F5F5F6" />
                ) : (
                  <Text className="text-center font-inter-semi-bold text-base text-[#F5F5F6]">
                    Konfirmasi Laporan
                  </Text>
                )}
              </Pressable>
            )}

            {showCompleteButton && (
              <Pressable
                className="mx-1 mb-4 mt-6 rounded-full bg-[#2431AE] px-5 py-4"
                onPress={() => {
                  router.push({
                    pathname: '/(secure)/admin/laporanComplete',
                    params: { reportId: reportIdString, title: report.title },
                  });
                }}>
                <Text className="text-center font-inter-semi-bold text-base text-[#F5F5F6]">
                  Laporkan Penyelesaian
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReport}
        title="Konfirmasi Laporan"
        description="Apakah kamu yakin ingin mengkonfirmasi laporan ini? Status akan berubah menjadi 'Dikonfirmasi' dan pelapor akan mendapat 10 poin."
        cancelText="Kembali"
        confirmText="Ya, Konfirmasi"
      />

      {/* Complete Modal */}
      <ConfirmationModal
        visible={showCompleteModal}
        onCancel={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteReport}
        title="Selesaikan Laporan"
        description="Apakah penanganan laporan ini sudah selesai? Status akan berubah menjadi 'Selesai' dan pelapor akan mendapat 15 poin."
        cancelText="Kembali"
        confirmText="Ya, Selesai"
      />

      {/* Image Preview Modal */}
      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleClosePreview}>
        <View
          className="flex-1 items-center justify-center bg-black/80"
          style={{ paddingHorizontal: MODAL_HORIZONTAL_PADDING }}>
          <TouchableWithoutFeedback onPress={handleClosePreview}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>

          {previewImage ? (
            <View className="overflow-hidden rounded-2xl bg-black">
              <Image
                source={{ uri: previewImage }}
                style={{
                  width: modalImageWidth,
                  height: modalImageHeight,
                }}
                resizeMode="contain"
              />
              <Pressable
                className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-black/60"
                onPress={handleClosePreview}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
