import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReportStatus, StatusHistoryEntry } from '@/utils/types/riwayat.types';

const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: 'Draft',
  diperiksa: 'Sedang diperiksa',
  dikonfirmasi: 'Dikonfirmasi',
  dalam_penanganan: 'Sedang dalam penanganan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) {
    return '-';
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
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
  const timelineItems = useMemo(() => {
    if (!statusHistory?.length) {
      return [];
    }

    const toTimestamp = (value: string) => {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return [...statusHistory]
      .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp))
      .map((item) => ({
        title: STATUS_LABEL[item.status] ?? item.status,
        desc: item.description,
        date: formatTimestamp(item.timestamp),
        active: item.status === currentStatus,
      }));
  }, [statusHistory, currentStatus]);

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
          {timelineItems.length ? (
            timelineItems.map((item, index) => (
              <View
                key={`${item.title}-${item.date}-${index}`}
                className="relative mb-5 flex-row items-start">
                {/* Timeline connector */}
                {index < timelineItems.length - 1 && (
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
                  <Text
                    className={`font-medium ${item.active ? 'text-green-600' : 'text-gray-700'}`}>
                    {item.title}
                  </Text>
                  {!!item.desc && <Text className="text-sm text-gray-500">{item.desc}</Text>}
                  <Text className="mt-1 text-xs text-gray-400">{item.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-500">
              Belum ada riwayat status untuk laporan ini.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
