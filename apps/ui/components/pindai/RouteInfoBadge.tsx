import React from 'react';
import { View, Pressable, ActivityIndicator, Text } from 'react-native';

interface RouteInfoBadgeProps {
  isLoadingRoute: boolean;
  routeError: any;
  analysisStatus: 'idle' | 'loading' | 'success' | 'error';
  isResultModalVisible: boolean;
  hasRouteData: boolean;
  onShowResults: () => void;
}

export default function RouteInfoBadge({
  isLoadingRoute,
  routeError,
  analysisStatus,
  isResultModalVisible,
  hasRouteData,
  onShowResults,
}: RouteInfoBadgeProps) {
  return (
    <View className="absolute bottom-40 left-4 right-4 items-center">
      <View className="rounded-2xl bg-white px-4 py-3 shadow-sm">
        {isLoadingRoute ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#5572FF" />
            <Text className="font-inter-medium text-sm text-[#1A1A1A]">Mencari rute...</Text>
          </View>
        ) : routeError ? (
          <Text className="font-inter-medium text-sm text-red-500">Gagal memuat rute</Text>
        ) : (
          hasRouteData &&
          analysisStatus !== 'idle' &&
          !isResultModalVisible && (
            <Pressable onPress={onShowResults}>
              <Text className="font-inter-semibold text-base text-[#5572FF]">
                {analysisStatus === 'success' ? 'Lihat hasil analisis' : 'Lihat status analisis'}
              </Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}
