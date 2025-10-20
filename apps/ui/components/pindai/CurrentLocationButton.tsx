import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';

interface CurrentLocationButtonProps {
  onPress: () => void;
}

export default function CurrentLocationButton({ onPress }: CurrentLocationButtonProps) {
  return (
    <Pressable
      className="absolute bottom-44 right-8 items-center rounded-[10px] bg-white p-3"
      onPress={onPress}>
      <View>
        <Image source={require('@/assets/icons/cursor.svg')} style={{ width: 20, height: 20 }} />
      </View>
    </Pressable>
  );
}
