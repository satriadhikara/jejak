import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from '@/components/error';
import LocationPickerBottomSheet from '@/components/location-search/LocationPickerBottomSheet';
import { useLocationContext } from '@/lib/location-context';

export default function PickLocation() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const { setSelectedLocation: setContextLocation } = useLocationContext();

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  } | null>(null);

  // Check and request location permission when component mounts
  const { data: hasLocationPermission } = useQuery({
    queryKey: ['locationPermission'],
    queryFn: async () => {
      try {
        // First check if permission is already granted
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        if (existingStatus === 'granted') {
          return true;
        }

        // If not granted, request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      } catch (error) {
        console.error('Error setting up location permission:', error);
        return false;
      }
    },
    staleTime: Infinity, // Permission doesn't change during this session
  });

  // Fetch user location using TanStack Query
  const {
    data: userLocation,
    isLoading: isLoadingLocation,
    error: locationError,
  } = useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    },
    enabled: hasLocationPermission === true,
    retry: 2,
  });

  // Center map on user location when it's first fetched
  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Wait a bit for the map to fully initialize
      const timer = setTimeout(() => {
        try {
          mapRef.current?.setCameraPosition({
            coordinates: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            zoom: 15,
            animationDuration: 500,
          });
        } catch (error) {
          console.warn('Map not ready yet:', error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  }) => {
    setSelectedLocation(location);

    // Move map camera to selected location
    if (mapRef.current) {
      try {
        mapRef.current.setCameraPosition({
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 17,
          animationDuration: 500,
        });
      } catch (error) {
        console.warn('Failed to set camera position:', error);
      }
    }

    setIsSearchModalVisible(false);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Pilih lokasi terlebih dahulu.');
      return;
    }

    // Save location to context
    setContextLocation(selectedLocation);

    router.back();
  };

  // Show loading state while checking permission or fetching location
  if (hasLocationPermission === undefined || isLoadingLocation) {
    return (
      <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1437B9" />
        <Text className="mt-4 font-inter-medium text-sm text-gray-600">
          {hasLocationPermission === undefined
            ? 'Memeriksa izin lokasi...'
            : 'Mengambil lokasi Anda...'}
        </Text>
      </View>
    );
  }

  // Show error if permission denied
  if (hasLocationPermission === false) {
    return <ErrorComponent message="Izin lokasi diperlukan untuk menggunakan fitur ini." />;
  }

  // Show error if location fetch failed
  if (locationError) {
    return <ErrorComponent message="Gagal mendapatkan lokasi Anda. Silakan coba lagi." />;
  }

  // Show error if no user location available
  if (!userLocation) {
    return <ErrorComponent message="Tidak dapat menentukan lokasi Anda saat ini." />;
  }

  return (
    <>
      <GoogleMaps.View
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        cameraPosition={{
          coordinates: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        }}
        properties={{
          isMyLocationEnabled: hasLocationPermission === true,
        }}
        uiSettings={{
          myLocationButtonEnabled: false,
        }}
        userLocation={{
          coordinates: userLocation,
          followUserLocation: false,
        }}
        markers={
          selectedLocation
            ? [
                {
                  coordinates: {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  },
                  title: selectedLocation.address,
                },
              ]
            : []
        }
      />

      <SafeAreaView className="flex-1" pointerEvents="box-none">
        {/* Header */}
        <View className="mx-4 flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text className="ml-3 flex-1 font-inter-semi-bold text-lg text-gray-950">
            Pilih Lokasi
          </Text>
        </View>

        {/* Bottom Search Button */}
        <View className="absolute bottom-0 left-0 right-0">
          {!selectedLocation ? (
            <View className="m-4 rounded-2xl bg-white px-4 py-4 shadow-sm">
              <Pressable
                className="flex-row items-center"
                onPress={() => setIsSearchModalVisible(true)}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <Text className="ml-3 flex-1 font-inter-regular text-base text-gray-400">
                  Cari lokasi...
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="bg-white py-4 rounded-t-[32px]">
              <View className="px-5 pt-5">
                {/* Title and Ubah Button */}
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="flex-1 font-inter-semi-bold text-lg text-gray-950">
                    Lokasi kerusakan
                  </Text>
                  <Pressable
                    className="ml-2 rounded-full border border-[#1437B9] px-6 py-2"
                    onPress={() => setIsSearchModalVisible(true)}>
                    <Text className="font-inter-semi-bold text-sm text-[#1437B9]">Ubah</Text>
                  </Pressable>
                </View>

                {/* Location Card */}
                <View className="mb-5 flex-row items-start gap-3 rounded-2xl bg-[#EAFFF6] p-4">
                  <View className="mt-1 h-8 w-8 items-center justify-center rounded-full bg-[#1437B9]">
                    <Ionicons name="location" size={16} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-semi-bold text-base text-gray-950">
                      {selectedLocation.mainText}
                    </Text>
                    <Text className="mt-1 font-inter-regular text-sm text-gray-600">
                      {selectedLocation.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Simpan Button - Full Width */}
              <Pressable
                className="rounded-full bg-[#1437B9] py-4 mx-4 mb-14"
                onPress={handleConfirmLocation}>
                <Text className="text-center font-inter-semi-bold text-base text-white">
                  Simpan
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>

      <LocationPickerBottomSheet
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
      />
    </>
  );
}
