import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

interface LocationSelectorProps {
  selectedLocation: {
    mainText: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null;
}

export const LocationSelector = ({ selectedLocation }: LocationSelectorProps) => {
  const _mapRef = useRef<any>(null);
  const router = useRouter();

  return (
    <>
      <Text className="mb-2 font-inter-medium text-sm text-gray-700">
        Lokasi <Text className="text-[#EB3030]">*</Text>
      </Text>
      {selectedLocation ? (
        <>
          {/* Location Detail Card - On Top */}
          <View className="mb-3 flex-row items-start gap-3 rounded-xl bg-[#EBF4FF] p-4">
            <View className="mt-1 h-5 w-5 items-center justify-center rounded-full bg-[#1437B9]">
              <Ionicons name="location" size={12} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-inter-semi-bold text-sm text-[#1437B9]">
                {selectedLocation.mainText}
              </Text>
              <Text className="mt-1 font-inter-regular text-xs text-[#1437B9]">
                {selectedLocation.address}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(secure)/pick-location')} className="mt-1">
              <Ionicons name="pencil" size={16} color="#1437B9" />
            </Pressable>
          </View>
          {/* Map - Below Detail */}
          <View className="mb-5 h-48 overflow-hidden rounded-xl border border-gray-200">
            <GoogleMaps.View
              ref={_mapRef}
              style={{ flex: 1 }}
              cameraPosition={{
                coordinates: {
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                },
                zoom: 16,
              }}
              markers={[
                {
                  coordinates: {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  },
                  title: selectedLocation.address,
                },
              ]}
            />
          </View>
        </>
      ) : (
        <Pressable
          onPress={() => router.push('/(secure)/pick-location')}
          className="mb-5 flex-row items-center justify-center rounded-xl px-5 py-4"
          style={{ backgroundColor: '#F5F5F6' }}>
          <MaterialIcons name="location-on" size={20} color="#4B4D53" />
          <Text
            className="ml-3 font-inter-medium text-base"
            style={{ color: '#4B4D53', fontWeight: '500' }}>
            Pilih Lokasi
          </Text>
        </Pressable>
      )}
    </>
  );
};
