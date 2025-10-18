import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropdownStatus from '@/components/riwayat/dropdown-status';
import { useAuthContext } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getStorageReadUrl, getUserReportById } from '@/utils/api/riwayat.api';
import { GoogleMaps } from 'expo-maps';

const MODAL_HORIZONTAL_PADDING = 24;

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
  const { riwayatId } = useLocalSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const { cookies } = useAuthContext();
  const windowDimensions = useWindowDimensions();

  const reportId = useMemo(() => {
    if (!riwayatId) return null;
    return Array.isArray(riwayatId) ? riwayatId[0] : riwayatId;
  }, [riwayatId]);

  const reportQuery = useQuery({
    queryKey: ['userReportDetail', reportId, cookies],
    queryFn: () => getUserReportById(cookies ?? '', reportId ?? ''),
    enabled: Boolean(cookies) && Boolean(reportId),
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
    queryKey: ['userReportPhotos', reportId, photoKeys.join('|')],
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
    enabled: Boolean(cookies) && Boolean(reportId) && photoKeys.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  const photoData = photosQuery.data ?? [];
  const photosErrorMessage =
    photosQuery.error instanceof Error
      ? photosQuery.error.message
      : 'Terjadi kesalahan saat memuat foto laporan.';

  const handleClosePreview = () => setPreviewImage(null);
  const modalImageWidth = windowDimensions.width - MODAL_HORIZONTAL_PADDING * 2;
  const modalImageHeight = windowDimensions.height * 0.6;

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

        {!reportId ? (
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

            {/* Status Summary */}
            {/* <View className="mb-5 rounded-2xl border border-[#D7E3FF] bg-[#EDF4FF] px-4 py-3">
              <Text className="font-inter-medium text-xs uppercase text-[#2431AE]">Status</Text>
              <Text className="font-inter-semi-bold text-lg text-[#1A2B88]">
                {STATUS_LABEL[report.status]}
              </Text>
            </View> */}

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
            <View className="mb-4 gap-3">
              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">Lokasi</Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.locationName}
                </Text>
              </View>

              {/* Map placeholder */}
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
                  Kategori kerusakan
                </Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.damageCategory}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">Dampak kerusakan</Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.impactOfDamage || 'Tidak ada informasi dampak.'}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="font-inter-semi-bold text-xs text-gray-300">Catatan</Text>
                <Text className="font-inter-regular text-sm text-[#242528]">
                  {report.description || 'Tidak ada catatan tambahan.'}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

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
