import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from '@/components/error';
import LocationSearchBottomSheet from '@/components/location-search/LocationSearchBottomSheet';
import { getDirections } from '@/utils/api/places.api';

export default function Pindai() {
  const mapRef = useRef<any>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [searchMode, setSearchMode] = useState<'origin' | 'destination'>('origin');
  const [selectedOrigin, setSelectedOrigin] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
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

  // Fetch route using Google Routes API v2 when both origin and destination are selected
  const {
    data: routeData,
    isLoading: isLoadingRoute,
    error: routeError,
  } = useQuery({
    queryKey: ['routes', selectedOrigin, selectedDestination],
    queryFn: async () => {
      if (!selectedOrigin || !selectedDestination) return null;
      return await getDirections(
        {
          latitude: selectedOrigin.latitude,
          longitude: selectedOrigin.longitude,
        },
        {
          latitude: selectedDestination.latitude,
          longitude: selectedDestination.longitude,
        }
      );
    },
    enabled: !!selectedOrigin && !!selectedDestination,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
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
    setSearchMode('origin');
    setIsSearchModalVisible(true);
  };

  const handleDestinationPress = () => {
    setSearchMode('destination');
    setIsSearchModalVisible(true);
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  }) => {
    if (searchMode === 'origin') {
      setSelectedOrigin(location);
    } else {
      setSelectedDestination(location);
    }

    // Move map camera to show both markers if both are selected
    if (mapRef.current) {
      const origin = searchMode === 'origin' ? location : selectedOrigin;
      const destination = searchMode === 'destination' ? location : selectedDestination;

      if (origin && destination) {
        // Calculate bounds to fit both markers
        const minLat = Math.min(origin.latitude, destination.latitude);
        const maxLat = Math.max(origin.latitude, destination.latitude);
        const minLng = Math.min(origin.longitude, destination.longitude);
        const maxLng = Math.max(origin.longitude, destination.longitude);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Calculate appropriate zoom level based on distance
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        // Rough zoom calculation (adjust as needed)
        let zoom = 15;
        if (maxDiff > 0.1) zoom = 13;
        else if (maxDiff > 0.05) zoom = 14;
        else if (maxDiff > 0.02) zoom = 15;
        else if (maxDiff > 0.01) zoom = 15;

        mapRef.current.setCameraPosition({
          coordinates: {
            latitude: centerLat,
            longitude: centerLng,
          },
          zoom: zoom,
          animationDuration: 500,
        });
      } else {
        // Only one location selected, center on it
        mapRef.current.setCameraPosition({
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          zoom: 17,
          animationDuration: 500,
        });
      }
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
        markers={[
          ...(selectedOrigin
            ? [
                {
                  coordinates: {
                    latitude: selectedOrigin.latitude,
                    longitude: selectedOrigin.longitude,
                  },
                  title: selectedOrigin.address,
                },
              ]
            : []),
          ...(selectedDestination
            ? [
                {
                  coordinates: {
                    latitude: selectedDestination.latitude,
                    longitude: selectedDestination.longitude,
                  },
                  title: selectedDestination.address,
                },
              ]
            : []),
        ]}
        polylines={
          routeData?.coordinates
            ? [
                {
                  coordinates: routeData.coordinates,
                  color: '#5572FF',
                  width: 6,
                },
              ]
            : selectedOrigin && selectedDestination && routeError
              ? [
                  {
                    coordinates: [
                      {
                        latitude: selectedOrigin.latitude,
                        longitude: selectedOrigin.longitude,
                      },
                      {
                        latitude: selectedDestination.latitude,
                        longitude: selectedDestination.longitude,
                      },
                    ],
                    color: '#FF5757',
                    width: 5,
                  },
                ]
              : []
        }
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
                {selectedOrigin ? selectedOrigin.mainText : 'Cari titik awal'}
              </Text>
            </Pressable>
            <View className="h-[1px] w-full rounded-full bg-[#E5E6E8]" />
            <Pressable onPress={handleDestinationPress} className="py-4 pl-2 pr-4">
              <Text
                className="font-inter-medium text-sm"
                style={{ color: selectedDestination ? '#1A1A1A' : '#ABAFB5' }}
                numberOfLines={1}>
                {selectedDestination ? selectedDestination.mainText : 'Cari titik tujuan'}
              </Text>
            </Pressable>
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

        {/* Route Info Badge */}
        {selectedOrigin && selectedDestination && (
          <View className="absolute bottom-40 left-4 right-4 items-center">
            <View className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              {isLoadingRoute ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#5572FF" />
                  <Text className="font-inter-medium text-sm text-[#1A1A1A]">Mencari rute...</Text>
                </View>
              ) : routeError ? (
                <Text className="font-inter-medium text-sm text-red-500">Gagal memuat rute</Text>
              ) : routeData ? (
                <View className="flex-row items-center gap-2">
                  <Text className="font-inter-semibold text-base text-[#5572FF]">
                    {routeData.distance}
                  </Text>
                  <Text className="font-inter-regular text-sm text-[#8E8E93]">•</Text>
                  <Text className="font-inter-medium text-sm text-[#1A1A1A]">
                    {routeData.duration}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </SafeAreaView>

      <LocationSearchBottomSheet
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
        mode={searchMode}
        originValue={selectedOrigin}
        destinationValue={selectedDestination}
      />
    </>
  );
}
