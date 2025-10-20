import React from 'react';
import { Modal, View, Text, Image, Pressable } from 'react-native';

interface RewardModalProps {
  visible: boolean;
  onDismiss: () => void;
  points?: number;
  title?: string;
  buttonText?: string;
}

const RewardModal = ({
  visible,
  onDismiss,
  points = 5,
  title = 'Selamat!',
  buttonText = 'OK',
}: RewardModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <View className="flex-1 bg-[#00D996] items-center justify-center px-6">
      {/* Points Text */}
      <Text className="text-white text-5xl font-inter-semi-bold mb-6">+{points} Poin</Text>

      <Image source={require('@/assets/clap.png')} className="w-96 h-96 z-10" />

      <Image
        source={require('@/assets/bg-reward.png')}
        className="absolute w-auto -bottom-52 z-5"
      />

      {/* Message */}
      <View className="items-center px-10 z-10">
        <Text className="font-inter-semi-bold text-xl text-white mb-2">{title}</Text>
        <Text className="font-inter-regular text-sm text-center text-white leading-5">
          Kamu dapat <Text className="font-inter-bold">+5 poin Jejak</Text> karena sudah melaporkan
          kerusakan. Terima kasih atas kontribusimu!
        </Text>
      </View>

      {/* OK Button */}
      <Pressable
        onPress={onDismiss}
        className="mt-10 w-72 bg-white rounded-full py-3 items-center justify-center shadow-md z-10">
        <Text className="font-inter-semi-bold text-[#009874] text-base">{buttonText}</Text>
      </Pressable>
    </View>
  </Modal>
);

export default RewardModal;
