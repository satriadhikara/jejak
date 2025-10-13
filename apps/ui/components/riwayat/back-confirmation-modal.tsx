import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({ visible, onCancel, onConfirm }: ConfirmationModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View className="flex-1 items-center justify-center bg-black/50 px-9">
      <View className="w-full rounded-2xl bg-white p-6">
        <Text className="mb-2 text-center font-inter-semi-bold text-2xl text-gray-950">
          Batalkan perubahan?
        </Text>
        <Text className="mb-6 text-center font-inter-regular text-base text-gray-600">
          Dengan membatalkan akan menghapus permanen seluruh perubahan yang telah kamu buat.
        </Text>

        <View className="flex-row justify-center">
          <Pressable
            onPress={onCancel}
            className="mr-2 flex-1 rounded-full border border-gray-300 bg-gray-50 py-3">
            <Text className="text-center font-semibold text-gray-700">Kembali</Text>
          </Pressable>
          <Pressable onPress={onConfirm} className="ml-2 flex-1 rounded-full bg-[#EB3030] py-3">
            <Text className="text-center font-semibold text-gray-50">Batal</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

export default ConfirmationModal;
