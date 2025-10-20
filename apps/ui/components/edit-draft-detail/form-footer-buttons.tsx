import React from 'react';
import { View, Pressable, Text } from 'react-native';

interface FormFooterButtonsProps {
  isSubmitting: boolean;
  pendingStatus: 'draft' | 'diperiksa' | null;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export const FormFooterButtons = ({
  isSubmitting,
  pendingStatus,
  onSaveDraft,
  onSubmit,
}: FormFooterButtonsProps) => {
  return (
    <View className="absolute bottom-5 left-0 right-0 flex-row justify-between bg-transparent px-4 py-4">
      <Pressable
        disabled={isSubmitting}
        onPress={onSaveDraft}
        className={`mr-2 flex-1 rounded-full border border-gray-300 bg-gray-50 py-3 ${
          isSubmitting ? 'opacity-50' : ''
        }`}>
        <Text className="text-center font-semibold text-gray-700">
          {isSubmitting && pendingStatus === 'draft' ? 'Menyimpan...' : 'Save as Draft'}
        </Text>
      </Pressable>
      <Pressable
        disabled={isSubmitting}
        className={`ml-2 flex-1 rounded-full bg-[#1437B9] py-3 ${isSubmitting ? 'opacity-50' : ''}`}
        onPress={onSubmit}>
        <Text className="text-center font-semibold text-white">
          {isSubmitting && pendingStatus === 'diperiksa' ? 'Mengirim...' : 'Submit'}
        </Text>
      </Pressable>
    </View>
  );
};
