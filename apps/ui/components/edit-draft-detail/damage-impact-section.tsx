import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DamageImpactSectionProps {
  adaDampak: string | null;
  impactDamage: string;
  catatan: string;
  onAdaDampakChange: (value: string) => void;
  onImpactDamageChange: (value: string) => void;
  onCatatanChange: (value: string) => void;
}

export const DamageImpactSection = ({
  adaDampak,
  impactDamage,
  catatan,
  onAdaDampakChange,
  onImpactDamageChange,
  onCatatanChange,
}: DamageImpactSectionProps) => {
  return (
    <>
      {/* Dampak */}
      <Text className="mb-2 font-inter-medium text-sm text-gray-700">
        Apakah ada dampak dari kerusakan? <Text className="text-[#EB3030]">*</Text>
      </Text>
      <View className="mb-5">
        {['ya', 'tidak'].map((val) => {
          const isSelected = adaDampak === val;
          return (
            <View
              key={val}
              className={`mb-3 flex-row items-center rounded-xl border px-3 py-4 ${
                isSelected ? 'border-[#2A37D8] bg-[#EBF4FF]' : 'border-gray-200'
              }`}>
              <Pressable
                onPress={() => onAdaDampakChange(val)}
                className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                }`}>
                {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
              </Pressable>
              <Text
                className={`font-inter-medium text-base ${
                  isSelected ? 'text-[#2A37D8]' : 'text-gray-700'
                }`}>
                {val === 'ya' ? 'Ya' : 'Tidak'}
              </Text>
            </View>
          );
        })}
      </View>

      {adaDampak === 'ya' && (
        <>
          <Text className="mb-1 font-inter-medium text-sm text-gray-700">
            Dampak Kerusakan <Text className="text-[#EB3030]">*</Text>
          </Text>
          <TextInput
            className="mb-5 rounded-xl border border-gray-200 px-4 py-4 font-inter-regular text-base text-gray-950"
            placeholder="Tuliskan dampak yang terjadi"
            value={impactDamage}
            onChangeText={onImpactDamageChange}
          />
        </>
      )}

      {/* Catatan */}
      <Text className="mb-1 font-inter-medium text-sm text-gray-700">Catatan</Text>
      <TextInput
        className="mb-7 h-24 min-h-[131px] rounded-xl border border-gray-200 px-4 font-inter-regular text-gray-500"
        placeholder="Masukkan catatan tambahan terkait kerusakan..."
        multiline
        textAlignVertical="top"
        value={catatan}
        onChangeText={onCatatanChange}
      />
    </>
  );
};
