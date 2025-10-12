import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from '@/components/error';
import LocationSearchBottomSheet from '@/components/location-search/LocationSearchBottomSheet';

export default function Pindai() {
  const mapRef = useRef<any>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Check and request location permission when component mounts
  useEffect(() => {
    const setupLocationPermission = async () => {
      try {
        // First check if permission is already granted
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        if (existingStatus === 'granted') {
          setHasLocationPermission(true);
          return;
        }

        // If not granted, request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');

        if (status !== 'granted') {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error setting up location permission:', error);
        setHasLocationPermission(false);
      }
    };

    setupLocationPermission();
  }, []);

  // Fetch user location using TanStack Query
  const {
    data: userLocation,
    isLoading: isLoadingLocation,
    error: locationError,
    refetch: refetchUserLocation,
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
    staleTime: 5 * 60 * 1000, // Consider location fresh for 5 minutes
    retry: 2,
  });

  // Move camera to user location when it's first fetched
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCameraPosition({
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        zoom: 17,
        animationDuration: 500,
      });
    }
  }, [userLocation]);

  const handleCurrentLocation = async () => {
    // Check if permission is already granted
    if (hasLocationPermission !== true) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to show your current location. Please enable it in settings.'
      );
      return;
    }

    // Attempt to refetch the user's location for the latest coordinates
    const { data: latestLocation } = await refetchUserLocation();
    const coordinates = latestLocation ?? userLocation;

    if (!coordinates) {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
      return;
    }

    // Move camera to the freshest known user location
    if (mapRef.current) {
      mapRef.current.setCameraPosition({
        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        zoom: 17,
        animationDuration: 300,
      });
    }
  };

  const handleOriginPress = () => {
    setIsSearchModalVisible(true);
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setSelectedOrigin(location);

    // Move map camera to selected location
    if (mapRef.current) {
      mapRef.current.setCameraPosition({
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        zoom: 17,
        animationDuration: 500,
      });
    }
  };

  if (hasLocationPermission === null || (hasLocationPermission === true && isLoadingLocation)) {
    return (
      <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0066CC" />
        <Text className="mt-4 font-inter-medium text-sm text-gray-600">
          {hasLocationPermission === null
            ? 'Checking location permissions...'
            : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  if (hasLocationPermission === false) {
    return <ErrorComponent message="Location permission is required to use this feature." />;
  }

  if (locationError) {
    return <ErrorComponent message="Failed to get your location. Please try again." />;
  }

  if (!userLocation) {
    return <ErrorComponent message="Unable to determine your location right now." />;
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
      />
      <SafeAreaView className="flex-1" pointerEvents="box-none">
        <View className="mx-4 mt-8 flex-row items-center gap-[10px] rounded-2xl border border-[#E5E6E8] bg-white px-4">
          <View>
            <Image source={require('../../../assets/map.png')} style={{ width: 24, height: 74 }} />
          </View>

          <View className="flex-1">
            <Pressable onPress={handleOriginPress} className="py-4 pl-2 pr-4">
              <Text
                className="font-inter-medium text-sm"
                style={{ color: selectedOrigin ? '#1A1A1A' : '#ABAFB5' }}
                numberOfLines={1}>
                {selectedOrigin ? selectedOrigin.address : 'Cari titik awal'}
              </Text>
            </Pressable>
            <View className="h-[1px] w-full rounded-full bg-[#E5E6E8]" />
            <View className="py-4 pl-2 pr-4">
              <Text className="font-inter-medium text-sm text-[#ABAFB5]">Cari titik tujuan</Text>
            </View>
          </View>
        </View>

        <Pressable
          className="absolute bottom-44 right-8 items-center rounded-[10px] bg-white p-3"
          onPress={handleCurrentLocation}>
          <View>
            <Image
              source={require('../../../assets/icons/cursor.svg')}
              style={{ width: 20, height: 20 }}
            />
          </View>
        </Pressable>
      </SafeAreaView>

      <LocationSearchBottomSheet
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
      />
    </>
  );
}
