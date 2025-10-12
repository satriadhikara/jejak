import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, Pressable, Alert } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import LocationSearchBottomSheet from '@/components/location-search/LocationSearchBottomSheet';

export default function Pindai() {
  const mapRef = useRef<any>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const handleCurrentLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Update user location state
      setUserLocation({ latitude, longitude });

      // Move camera to current location
      if (mapRef.current) {
        mapRef.current.setCameraPosition({
          coordinates: {
            latitude,
            longitude,
          },
          zoom: 17,
          animationDuration: 300,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
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

  return (
    <>
      <GoogleMaps.View
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        cameraPosition={{
          coordinates: {
            latitude: -6.17511,
            longitude: 106.865036,
          },
          zoom: 15,
        }}
        properties={{
          isMyLocationEnabled: true,
        }}
        uiSettings={{
          myLocationButtonEnabled: false,
        }}
        userLocation={
          userLocation
            ? {
                coordinates: userLocation,
                followUserLocation: false,
              }
            : undefined
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
        currentLocation={userLocation ?? undefined}
      />
    </>
  );
}
