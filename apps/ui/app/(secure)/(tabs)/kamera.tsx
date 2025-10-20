import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { File as ExpoFile } from 'expo-file-system';
import { useAuthContext } from '@/lib/auth-context';
import { analyzeReportImage } from '@/utils/api/riwayat.api';

const FLASH_SEQUENCE: FlashMode[] = ['off', 'on', 'auto'];

export default function Kamera() {
  const router = useRouter();
  const { cookies } = useAuthContext();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [facing, setFacing] = useState<CameraType>('back');
  const [flashIndex, setFlashIndex] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (permission === null) {
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!isFocused) {
      setIsCameraReady(false);
    }
  }, [isFocused]);

  const flash = FLASH_SEQUENCE[flashIndex];

  const cycleFlash = () => {
    setFlashIndex((prev) => (prev + 1) % FLASH_SEQUENCE.length);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const analyzeAndNavigate = async (imageUri: string) => {
    setIsAnalyzing(true);
    const cookieHeader = typeof cookies === 'string' ? cookies : '';

    if (!cookieHeader) {
      Alert.alert('Sesi tidak ditemukan', 'Silakan masuk kembali.');
      setIsAnalyzing(false);
      return;
    }

    try {
      // Read image as base64 using new File API
      const file = new ExpoFile(imageUri);

      // Read file as bytes and convert to base64
      const bytes = await file.bytes();
      const base64String = btoa(String.fromCharCode(...bytes));

      // Determine mime type from URI
      const extension = imageUri.toLowerCase().split('.').pop();
      let mimeType = 'image/jpeg';
      if (extension === 'png') {
        mimeType = 'image/png';
      } else if (extension === 'webp') {
        mimeType = 'image/webp';
      }

      // Call AI analysis
      const analysis = await analyzeReportImage(cookieHeader, base64String, mimeType);

      // Navigate with AI-generated data
      router.push({
        pathname: '/edit-draft-detail',
        params: {
          imageUris: JSON.stringify([imageUri]),
          title: analysis.title,
          kategori: analysis.damageCategory,
          adaDampak: analysis.hasImpact ? 'ya' : 'tidak',
          impactDamage: analysis.impactDescription || '',
          catatan: analysis.notes || '',
        },
      });
    } catch (error) {
      console.error('Failed to analyze image:', error);
      Alert.alert(
        'Analisis Gagal',
        'Tidak dapat menganalisis gambar. Melanjutkan tanpa analisis AI.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate without AI analysis
              router.push({
                pathname: '/edit-draft-detail',
                params: {
                  imageUris: JSON.stringify([imageUri]),
                },
              });
            },
          },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing || isAnalyzing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setIsCapturing(false);
        await analyzeAndNavigate(photo.uri);
      }
    } catch (error) {
      console.warn('Failed to take picture', error);
      setIsCapturing(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (isAnalyzing) {
      return;
    }

    try {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = permission.status;

      if (status !== 'granted') {
        const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = requestResult.status;
      }

      if (status !== 'granted') {
        Alert.alert(
          'Izin Galeri Diperlukan',
          'Aktifkan akses galeri agar kamu bisa memilih dokumentasi dari penyimpanan perangkat.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: false, // Changed to false for AI analysis
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length) {
        const firstImage = result.assets[0];
        if (firstImage?.uri) {
          await analyzeAndNavigate(firstImage.uri);
        }
      }
    } catch (error) {
      console.warn('Failed to pick images', error);
      Alert.alert('Galeri tidak dapat dibuka', 'Coba lagi dalam beberapa saat.');
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFB]">
        <ActivityIndicator size="large" color="#2431AE" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAFAFB] px-8">
        <Ionicons name="camera" size={54} color="#2431AE" />
        <Text className="mt-5 text-center text-[22px] font-bold text-[#2431AE]">
          Izin Kamera Diperlukan
        </Text>
        <Text className="mt-1 text-center text-base leading-6 text-[#4B5563]">
          Untuk membuat laporan baru, aktifkan akses kamera agar kamu bisa mengambil dokumentasi
          kerusakan.
        </Text>

        {permission.canAskAgain && (
          <Pressable
            className="mt-3 rounded-full bg-[#2431AE] px-7 py-3"
            onPress={() => requestPermission()}>
            <Text className="text-base font-semibold text-white">Berikan Izin Kamera</Text>
          </Pressable>
        )}

        <Pressable
          className="mt-2 rounded-full border border-[#2431AE] px-7 py-3"
          onPress={handleOpenSettings}>
          <Text className="text-base font-semibold text-[#2431AE]">Buka Pengaturan</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="relative flex-1 bg-black">
        {isFocused ? (
          <CameraView
            ref={cameraRef}
            style={{
              position: 'absolute',
              inset: 0,
            }}
            facing={facing}
            flash={flash}
            active={isFocused}
            onCameraReady={() => setIsCameraReady(true)}
          />
        ) : (
          <View className="absolute inset-0 bg-black" />
        )}

        {!isCameraReady && isFocused && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {isAnalyzing && (
          <View className="absolute inset-0 items-center justify-center bg-black/70">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="mt-4 text-lg font-semibold text-white">Menganalisis gambar...</Text>
            <Text className="mt-2 px-8 text-center text-sm text-gray-300">
              AI sedang memproses foto untuk mengisi detail laporan secara otomatis
            </Text>
          </View>
        )}

        <View className="absolute left-6 right-6" style={{ top: insets.top + 16 }}>
          <Text className="text-[22px] font-bold text-white">Ambil Dokumentasi</Text>
          <Text className="mt-1 text-sm text-gray-200">
            Pastikan area kerusakan terlihat jelas dan tajam.
          </Text>
        </View>
      </View>

      <View className="bg-[#060818] px-6 pt-5" style={{ paddingBottom: insets.bottom + 28 }}>
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-[52px] w-[52px] items-center justify-center rounded-full bg-black/60"
            onPress={cycleFlash}
            disabled={isAnalyzing}>
            <Ionicons
              name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash' : 'flash-outline'}
              size={22}
              color="#ffffff"
            />
          </Pressable>

          <Pressable
            className={`h-[86px] w-[86px] items-center justify-center rounded-full border-4 border-white ${
              !isCameraReady || isCapturing || isAnalyzing ? 'opacity-50' : ''
            }`}
            onPress={handleTakePicture}
            disabled={!isCameraReady || isCapturing || isAnalyzing}>
            <View
              className={`h-[64px] w-[64px] rounded-full ${
                isCapturing || isAnalyzing ? 'bg-gray-300' : 'bg-white'
              }`}
            />
          </Pressable>

          <Pressable
            className="h-[52px] w-[52px] items-center justify-center rounded-full bg-black/60"
            onPress={toggleFacing}
            disabled={isAnalyzing}>
            <Ionicons name="camera-reverse" size={24} color="#ffffff" />
          </Pressable>
        </View>

        <Pressable
          className="mt-6 flex-row items-center justify-center rounded-full border border-white/20 px-5 py-3"
          onPress={handlePickFromGallery}
          disabled={isAnalyzing}>
          <Ionicons name="images-outline" size={18} color="#ffffff" />
          <Text className="ml-2 text-sm font-medium text-white">Pilih dari galeri</Text>
        </Pressable>

        <Text className="mt-4 text-center text-xs text-gray-500">
          Foto akan dianalisis dengan AI untuk mengisi detail laporan secara otomatis.
        </Text>
      </View>
    </SafeAreaView>
  );
}
