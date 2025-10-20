import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StatusHistoryEntry, ReportStatus } from '@/utils/types/admin.types';

const STATUS_DISPLAY: Record<ReportStatus, string> = {
  draft: 'Draft',
  diperiksa: 'Laporan terkirim',
  dikonfirmasi: 'Dikonfirmasi',
  dalam_penanganan: 'Sedang dalam penanganan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export default function DropdownStatus({
  isOpen,
  setIsOpen,
  statusHistory,
  currentStatus,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  statusHistory: StatusHistoryEntry[];
  currentStatus: ReportStatus;
}) {
  // Sort history from newest to oldest
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} • ${hours}:${minutes} WIB`;
  };

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
          {sortedHistory.map((item, index) => {
            const isActive = item.status === currentStatus;
            return (
              <View
                key={`${item.status}-${item.timestamp}`}
                className="relative mb-5 flex-row items-start">
                {/* Timeline connector */}
                {index < sortedHistory.length - 1 && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 3.5,
                      top: 17,
                      height: '100%',
                      borderLeftWidth: 3,
                      borderColor: isActive ? '#6EE7B7' : '#D1D5DB',
                      borderStyle: 'dotted',
                    }}
                  />
                )}

                {/* Dot */}
                <View
                  className={`mt-2 h-3 w-3 items-center justify-center rounded-full ${
                    isActive ? 'bg-[#CDFEE5]' : 'bg-gray-400'
                  }`}>
                  {isActive && <View className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                </View>

                {/* Text content */}
                <View className="ml-4 flex-1">
                  <Text className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-700'}`}>
                    {STATUS_DISPLAY[item.status]}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-400">{formatDate(item.timestamp)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
