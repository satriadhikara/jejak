import React from 'react';
import { View, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

interface ImageDocumentationProps {
  imageUris: string[];
  onRemoveImage: (uri: string) => void;
  onAddImage: (uris: string[]) => void;
  isSubmitting: boolean;
}

export const ImageDocumentation = ({
  imageUris,
  onRemoveImage,
  onAddImage,
  isSubmitting,
}: ImageDocumentationProps) => {
  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets
        .map((asset) => asset.uri)
        .filter((uri): uri is string => typeof uri === 'string');
      onAddImage(uris);
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
      mediaTypes: 'images',
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uris = result.assets
        .map((asset) => asset.uri)
        .filter((uri): uri is string => typeof uri === 'string');
      onAddImage(uris);
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

  return (
    <View className="mb-5 flex-row flex-wrap gap-4">
      {imageUris.map((uri: string) => (
        <View key={uri} className="relative h-20 w-20">
          <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
          <Pressable
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1"
            onPress={() => onRemoveImage(uri)}>
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
  );
};
