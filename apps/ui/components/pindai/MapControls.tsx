import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  mainText: string;
}

interface MapControlsProps {
  selectedOrigin: LocationData | null;
  selectedDestination: LocationData | null;
  onOriginPress: () => void;
  onDestinationPress: () => void;
}

export default function MapControls({
  selectedOrigin,
  selectedDestination,
  onOriginPress,
  onDestinationPress,
}: MapControlsProps) {
  return (
    <View className="mx-4 mt-8 flex-row items-center gap-[10px] rounded-2xl border border-[#E5E6E8] bg-white px-4">
      <View>
        <Image source={require('@/assets/map.png')} style={{ width: 24, height: 74 }} />
      </View>

      <View className="flex-1">
        <Pressable onPress={onOriginPress} className="py-4 pl-2 pr-4">
          <Text
            className="font-inter-medium text-sm"
            style={{ color: selectedOrigin ? '#1A1A1A' : '#ABAFB5' }}
            numberOfLines={1}>
            {selectedOrigin ? selectedOrigin.mainText : 'Cari titik awal'}
          </Text>
        </Pressable>
        <View className="h-[1px] w-full rounded-full bg-[#E5E6E8]" />
        <Pressable onPress={onDestinationPress} className="py-4 pl-2 pr-4">
          <Text
            className="font-inter-medium text-sm"
            style={{ color: selectedDestination ? '#1A1A1A' : '#ABAFB5' }}
            numberOfLines={1}>
            {selectedDestination ? selectedDestination.mainText : 'Cari titik tujuan'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
