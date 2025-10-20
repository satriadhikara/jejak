import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface KategoriDropdownProps {
  selectedKategori: string;
  kategoriDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onSelectKategori: (value: string) => void;
}

const kategoriOptions = [
  { label: 'Ringan', value: 'ringan' },
  { label: 'Sedang', value: 'sedang' },
  { label: 'Berat', value: 'berat' },
];

export const KategoriDropdown = ({
  selectedKategori,
  kategoriDropdownOpen,
  onToggleDropdown,
  onSelectKategori,
}: KategoriDropdownProps) => {
  return (
    <View className="mb-5 rounded-xl border border-gray-200">
      <Pressable
        className="h-14 flex-row items-center justify-between px-4"
        onPress={onToggleDropdown}>
        <View className="flex-row items-center">
          <Text
            className={`font-inter-medium text-base ${
              selectedKategori ? 'text-gray-950' : 'text-gray-400'
            }`}>
            {selectedKategori
              ? kategoriOptions.find((opt) => opt.value === selectedKategori)?.label
              : 'Pilih kategori kerusakan'}
          </Text>
        </View>
        <Ionicons
          name={kategoriDropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#717680"
        />
      </Pressable>
      {kategoriDropdownOpen && (
        <View className="rounded-b-xl border-t border-gray-100 bg-white">
          {kategoriOptions.map((opt, idx) => {
            const isSelected = selectedKategori === opt.value;
            return (
              <Pressable
                key={opt.value}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
                onPress={() => {
                  onSelectKategori(opt.value);
                }}>
                <View className="flex-row items-center">
                  {/* Individual colored circle for each option */}
                  <View
                    className={`mr-2 h-2 w-2 rounded-full ${
                      idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-orange-400' : 'bg-red-500'
                    }`}
                  />
                  <Text className="font-inter-medium text-base text-gray-950">{opt.label}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark" size={23} color="#2A37D8" />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};
