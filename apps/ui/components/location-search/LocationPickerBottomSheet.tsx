import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import {
  searchPlaces,
  getPlaceDetails,
  reverseGeocode,
  type PlaceAutocomplete,
} from '@/utils/api/places.api';

interface LocationPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  }) => void;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function LocationPickerBottomSheet({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
}: LocationPickerBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

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
    enabled: !!currentLocation && visible,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search places
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: [
      'searchPlaces',
      debouncedSearchQuery,
      currentLocation?.latitude,
      currentLocation?.longitude,
    ],
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
      const selectedLocation = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        address: details.formatted_address,
        mainText: place.structured_formatting.main_text,
      };

      onLocationSelect(selectedLocation);
      setSearchQuery('');
      Keyboard.dismiss();
      onClose();
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleCurrentLocationSelect = () => {
    if (currentLocation && currentAddress) {
      const selectedLocation = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentAddress,
        mainText: 'Lokasimu saat ini',
      };

      onLocationSelect(selectedLocation);
      setSearchQuery('');
      Keyboard.dismiss();
      onClose();
    }
  };

  const renderPlaceItem = ({ item }: { item: PlaceAutocomplete }) => (
    <Pressable
      onPress={() => handlePlaceSelect(item)}
      className="border-b border-[#E5E6E8] px-4 py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
          <Ionicons name="location" size={20} color="#1437B9" />
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="slide"
      statusBarTranslucent>
      <View className="flex-1 bg-black/50">
        <View className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white">
          {/* Search Input */}
          <View className="border-b border-[#E5E6E8] px-4 pt-4 pb-3">
            <View className="mb-3 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                className="ml-3 flex-1 py-3 font-inter-regular text-base text-gray-950"
                placeholder="Cari lokasi..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Content */}
          <View className="h-96 flex-1">
            {searchQuery.trim().length === 0 ? (
              <>
                {/* Current Location */}
                {currentLocation && (
                  <Pressable onPress={handleCurrentLocationSelect} className="px-4 py-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EBF4FF]">
                        <Ionicons name="locate" size={20} color="#5572FF" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-base text-[#242528]">
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
                      <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                      <Text className="mt-2 font-inter-medium text-gray-400">Tidak ada hasil</Text>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  isSearching ? (
                    <View className="items-center justify-center py-4">
                      <ActivityIndicator size="small" color="#1437B9" />
                    </View>
                  ) : null
                }
              />
            )}
          </View>

          {/* Close Button */}
          <View className="border-t border-[#E5E6E8] px-4 py-4">
            <Pressable className="items-center rounded-full bg-gray-100 py-3" onPress={onClose}>
              <Text className="font-inter-semi-bold text-base text-gray-700">Tutup</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
