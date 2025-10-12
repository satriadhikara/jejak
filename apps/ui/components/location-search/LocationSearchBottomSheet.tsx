import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import {
  searchPlaces,
  getPlaceDetails,
  reverseGeocode,
  PlaceAutocomplete,
} from '@/utils/api/places.api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';

interface LocationSearchBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    placeId?: string;
  }) => void;
  currentLocation:
    | {
        latitude: number;
        longitude: number;
      }
    | null
    | undefined;
}

export default function LocationSearchBottomSheet({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
}: LocationSearchBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const currentLatitude = currentLocation?.latitude ?? null;
  const currentLongitude = currentLocation?.longitude ?? null;

  // Debounce search query
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch current location address
  const { data: currentAddress, isLoading: isLoadingCurrentAddress } = useQuery({
    queryKey: ['reverseGeocode', currentLocation?.latitude, currentLocation?.longitude],
    queryFn: async () => {
      if (!currentLocation) return null;
      try {
        const result = await reverseGeocode(currentLocation.latitude, currentLocation.longitude);
        return result.formatted_address;
      } catch (error) {
        console.error('Error loading current address:', error);
        return 'Lokasi saat ini';
      }
    },
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search places
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['searchPlaces', debouncedSearchQuery, currentLatitude, currentLongitude],
    queryFn: async () => {
      if (debouncedSearchQuery.trim().length <= 2) return [];
      return await searchPlaces(debouncedSearchQuery, currentLocation ?? undefined);
    },
    enabled: debouncedSearchQuery.trim().length > 2,
    staleTime: 30 * 1000, // 30 seconds
  });

  const displayedSearchResults = debouncedSearchQuery.trim().length > 2 ? searchResults : [];

  const handlePlaceSelect = async (place: PlaceAutocomplete) => {
    try {
      const details = await getPlaceDetails(place.place_id);
      onLocationSelect({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        address: details.formatted_address,
        placeId: details.place_id,
      });
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleCurrentLocationSelect = () => {
    if (currentLocation && currentAddress) {
      onLocationSelect({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentAddress,
      });
    }
  };

  const renderPlaceItem = ({ item }: { item: PlaceAutocomplete }) => (
    <Pressable
      onPress={() => handlePlaceSelect(item)}
      className="border-b border-[#E5E6E8] px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
          <Text className="text-lg">📍</Text>
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-base text-[#1A1A1A]">
            {item.structured_formatting.main_text}
          </Text>
          <Text className="font-inter-regular text-sm text-[#8E8E93]" numberOfLines={1}>
            {item.structured_formatting.secondary_text}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Search Fields Container */}
          <View className="mx-4 mt-8 flex-row items-center gap-[10px] rounded-2xl border border-[#E5E6E8] bg-white px-4">
            <View>
              <Image source={require('../../assets/map.png')} style={{ width: 24, height: 74 }} />
            </View>

            <View className="flex-1">
              <View className="py-4 pl-2 pr-4">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari titik awal"
                  placeholderTextColor="#ABAFB5"
                  className="!m-0 !p-0 font-inter-medium text-sm text-[#1A1A1A]"
                  autoFocus
                />
              </View>
              <View className="h-[1px] w-full rounded-full bg-[#E5E6E8]" />
              <View className="py-4 pl-2 pr-4">
                <Text className="font-inter-medium text-sm text-[#ABAFB5]">Cari titik tujuan</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            {searchQuery.trim().length === 0 ? (
              <>
                {/* Pick from Map */}
                <Pressable className="mx-4 mt-3 flex-row items-center gap-2 self-start rounded-full border border-[#E5E6E8] px-3 py-2.5">
                  <Ionicons name="map" size={18} color="#00D996" />
                  <Text className="font-inter-regular text-sm text-[#242528]">
                    Pilih titik di peta
                  </Text>
                </Pressable>

                {/* Current Location */}
                {currentLocation && (
                  <>
                    <Pressable onPress={handleCurrentLocationSelect} className="mt-5 px-4">
                      <View className="flex-row items-center gap-3">
                        <MaterialIcons name="my-location" size={24} color="#5572FF" />
                        <View className="flex-1">
                          <Text className="font-inter-semibold text-sm text-[#242528]">
                            Lokasimu saat ini
                          </Text>
                          {isLoadingCurrentAddress ? (
                            <ActivityIndicator size="small" color="#8E8E93" />
                          ) : (
                            <Text
                              className="font-inter-regular text-sm text-[#242528]"
                              numberOfLines={1}>
                              {currentAddress || 'Memuat alamat...'}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </>
                )}
              </>
            ) : (
              /* Search Results */
              <FlatList
                data={displayedSearchResults}
                renderItem={renderPlaceItem}
                keyExtractor={(item) => item.place_id}
                ListEmptyComponent={
                  debouncedSearchQuery.trim().length > 2 && !isSearching ? (
                    <View className="items-center justify-center py-8">
                      <Text className="font-inter-regular text-base text-[#8E8E93]">
                        Tidak ada hasil
                      </Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
