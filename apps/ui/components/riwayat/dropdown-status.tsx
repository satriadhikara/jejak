import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const statuses = [
  {
    title: 'Sedang dalam penanganan',
    desc: 'Perbaikan sedang dilakukan oleh tim lapangan',
    date: '6 Oktober 2025 • 08:00 WIB',
    active: true,
  },
  {
    title: 'Dikonfirmasi',
    desc: 'Kerusakan dikonfirmasi dan telah disetujui untuk ditindaklanjuti',
    date: '5 Oktober 2025 • 10:15 WIB',
    active: false,
  },
  {
    title: 'Sedang diperiksa',
    desc: 'Laporanmu sedang diperiksa oleh petugas',
    date: '4 Oktober 2025 • 09:30 WIB',
    active: false,
  },
  {
    title: 'Laporan terkirim',
    desc: 'Laporan kerusakanmu telah masuk ke sistem',
    date: '3 Oktober 2025 • 13:44 WIB',
    active: false,
  },
];

export default function DropdownStatus({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  return (
    <View className="mb-7 overflow-hidden rounded-2xl border border-gray-200">
      {/* Header */}
      <Pressable
        className="flex-row items-center justify-between px-4 py-3"
        onPress={() => setIsOpen(!isOpen)}>
        <Text className="text-base font-semibold text-gray-900">Update Permohonan</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#292D32" />
      </Pressable>

      {/* Dropdown Content */}
      {isOpen && (
        <View className="border-t border-gray-100 px-4 py-4">
          {statuses.map((item, index) => (
            <View key={index} className="relative mb-5 flex-row items-start">
              {/* Timeline connector */}
              {index < statuses.length - 1 && (
                <View
                  style={{
                    position: 'absolute',
                    left: 3.5,
                    top: 17,
                    height: '100%',
                    borderLeftWidth: 3,
                    borderColor: item.active ? '#6EE7B7' : '#D1D5DB',
                    borderStyle: 'dotted',
                  }}
                />
              )}

              {/* Dot */}
              <View
                className={`mt-2 h-3 w-3 items-center justify-center rounded-full ${
                  item.active ? 'bg-[#CDFEE5]' : 'bg-gray-400'
                }`}>
                {item.active && <View className="h-1.5 w-1.5 rounded-full bg-green-500" />}
              </View>

              {/* Text content */}
              <View className="ml-4 flex-1">
                <Text className={`font-medium ${item.active ? 'text-green-600' : 'text-gray-700'}`}>
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500">{item.desc}</Text>
                <Text className="mt-1 text-xs text-gray-400">{item.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
