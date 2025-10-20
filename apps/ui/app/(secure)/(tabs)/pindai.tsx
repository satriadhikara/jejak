import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { GoogleMaps } from 'expo-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from '@/components/error';
import LocationSearchBottomSheet from '@/components/location-search/LocationSearchBottomSheet';
import AnalyzeResultBottomSheet from '@/components/analyze/AnalyzeResultBottomSheet';
import MapControls from '@/components/pindai/MapControls';
import CurrentLocationButton from '@/components/pindai/CurrentLocationButton';
import RouteInfoBadge from '@/components/pindai/RouteInfoBadge';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useCameraManager } from '@/hooks/useCameraManager';
import { useRouteAnalysis } from '@/hooks/useRouteAnalysis';
import { useAuthContext } from '@/lib/auth-context';
import { getNearbyCompletedReports } from '@/utils/api/riwayat.api';

export default function Pindai() {
  const { cookies } = useAuthContext();
  const mapRef = useRef<any>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchMode, setSearchMode] = useState<'origin' | 'destination'>('origin');
  const [selectedOrigin, setSelectedOrigin] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  } | null>(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [_isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapRegion, setMapRegion] = useState<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // Use custom hooks
  const hasLocationPermission = useLocationPermission();
  const { setCameraPositionSafely, cleanup: cleanupCamera } = useCameraManager(mapRef);
  const {
    routeData,
    isLoadingRoute,
    routeError,
    analysisStatus,
    analysisResult,
    analysisError,
    handleRetryAnalysis,
    cleanup: cleanupAnalysis,
  } = useRouteAnalysis(selectedOrigin, selectedDestination, cookies);

  // Fetch nearby completed reports
  const nearbyReportsQuery = useQuery({
    queryKey: ['nearbyCompletedReports', mapRegion, cookies],
    queryFn: () =>
      mapRegion && cookies
        ? getNearbyCompletedReports(cookies, mapRegion)
        : Promise.resolve({ data: [] }),
    enabled: Boolean(mapRegion && cookies),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Debug: Log nearby reports data
  useEffect(() => {
    if (nearbyReportsQuery.data) {
      console.log('Nearby reports count:', nearbyReportsQuery.data.data.length);
      console.log('Nearby reports:', nearbyReportsQuery.data.data);
    }
    if (nearbyReportsQuery.error) {
      console.error('Error fetching nearby reports:', nearbyReportsQuery.error);
    }
  }, [nearbyReportsQuery.data, nearbyReportsQuery.error]);

  // Debug: Log map region
  useEffect(() => {
    if (mapRegion) {
      console.log('Map region bounds:', mapRegion);
    }
  }, [mapRegion]);

  // Fetch user location on permission grant
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Calculate map bounds from center coordinates and zoom level
  const calculateMapBounds = useCallback(
    (center: { latitude: number; longitude: number }, zoom: number) => {
      // More accurate calculation based on Google Maps zoom levels
      // At zoom level, the visible area at equator is approximately:
      // Width (degrees) = 360 / (2^zoom)
      // We adjust for latitude and add a reasonable visible area

      // Calculate approximate degrees per pixel at this zoom level
      // At zoom 0, the world is 256 pixels wide = 360 degrees
      // Each zoom level doubles the pixels, halving the degrees per pixel
      const scale = Math.pow(2, zoom);
      const degreesPerTile = 360 / scale;

      // Assuming typical mobile screen shows about 1.5-2 tiles
      // Let's use a reasonable viewport size
      const tilesVisible = 1.5;
      const latDelta = (degreesPerTile * tilesVisible) / 2;

      // Longitude adjustment for latitude (longitude lines converge at poles)
      const lngDelta = latDelta / Math.cos((center.latitude * Math.PI) / 180);

      const bounds = {
        minLat: center.latitude - latDelta,
        maxLat: center.latitude + latDelta,
        minLng: Math.min(center.longitude - lngDelta, center.longitude + lngDelta),
        maxLng: Math.max(center.longitude - lngDelta, center.longitude + lngDelta),
      };

      console.log('Calculated bounds:', bounds);
      console.log('Center:', center, 'Zoom:', zoom);
      console.log('Delta:', { latDelta, lngDelta });

      setMapRegion(bounds);
    },
    []
  );

  useEffect(() => {
    if (hasLocationPermission !== true) return;

    const fetchUserLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(coords);
        setLocationError(null);
        // Calculate initial map bounds
        calculateMapBounds(coords, 15);
      } catch (error) {
        console.error('Error fetching user location:', error);
        setLocationError('Failed to get your location');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchUserLocation();
  }, [hasLocationPermission, calculateMapBounds]);

  const handleCurrentLocation = async () => {
    if (hasLocationPermission !== true) {
      Alert.alert(
        'Permission Required',
        'Location permission is required to show your current location. Please enable it in settings.'
      );
      return;
    }

    try {
      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coordinates);
      setCameraPositionSafely({
        coordinates,
        zoom: 17,
      });
      // Update map bounds for nearby reports
      calculateMapBounds(coordinates, 17);
    } catch {
      Alert.alert('Error', 'Unable to get your location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleOriginPress = () => {
    setSearchMode('origin');
    setIsSearchModalVisible(true);
  };

  const handleDestinationPress = () => {
    setSearchMode('destination');
    setIsSearchModalVisible(true);
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    mainText: string;
  }) => {
    if (searchMode === 'origin') {
      setSelectedOrigin(location);
    } else {
      setSelectedDestination(location);
    }
  };

  // Close result modal when origin or destination changes
  useEffect(() => {
    setIsResultModalVisible(false);
  }, [selectedOrigin, selectedDestination]);

  // Update camera when locations change
  useEffect(() => {
    if (!selectedOrigin && !selectedDestination) {
      return;
    }

    if (selectedOrigin && selectedDestination) {
      const minLat = Math.min(selectedOrigin.latitude, selectedDestination.latitude);
      const maxLat = Math.max(selectedOrigin.latitude, selectedDestination.latitude);
      const minLng = Math.min(selectedOrigin.longitude, selectedDestination.longitude);
      const maxLng = Math.max(selectedOrigin.longitude, selectedDestination.longitude);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);

      let zoom = 15;
      if (maxDiff > 0.1) zoom = 13;
      else if (maxDiff > 0.05) zoom = 14;
      else if (maxDiff > 0.02) zoom = 15;
      else if (maxDiff > 0.01) zoom = 15;

      const center = {
        latitude: centerLat,
        longitude: centerLng,
      };

      setCameraPositionSafely({
        coordinates: center,
        zoom,
      });

      // Update map bounds for nearby reports
      calculateMapBounds(center, zoom);
      return;
    }

    const singleLocation = selectedOrigin ?? selectedDestination;
    if (!singleLocation) {
      return;
    }

    const coords = {
      latitude: singleLocation.latitude,
      longitude: singleLocation.longitude,
    };

    setCameraPositionSafely({
      coordinates: coords,
      zoom: 17,
    });

    // Update map bounds for nearby reports
    calculateMapBounds(coords, 17);
  }, [selectedDestination, selectedOrigin, setCameraPositionSafely, calculateMapBounds]);

  // Show result modal when analysis finishes
  useEffect(() => {
    if (analysisStatus !== 'idle' && !isResultModalVisible) {
      setIsResultModalVisible(true);
    }
  }, [analysisStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
      cleanupAnalysis();
    };
  }, [cleanupCamera, cleanupAnalysis]);

  if (hasLocationPermission === null || (hasLocationPermission === true && isLoadingLocation)) {
    return (
      <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0066CC" />
        <Text className="mt-4 font-inter-medium text-sm text-gray-600">
          {hasLocationPermission === null
            ? 'Checking location permissions...'
            : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  if (hasLocationPermission === false) {
    return <ErrorComponent message="Location permission is required to use this feature." />;
  }

  if (locationError) {
    return <ErrorComponent message="Failed to get your location. Please try again." />;
  }

  if (!userLocation) {
    return <ErrorComponent message="Unable to determine your location right now." />;
  }

  return (
    <>
      <GoogleMaps.View
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        cameraPosition={{
          coordinates: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: 15,
        }}
        properties={{
          isMyLocationEnabled: hasLocationPermission === true,
        }}
        uiSettings={{
          myLocationButtonEnabled: false,
        }}
        userLocation={{
          coordinates: userLocation,
          followUserLocation: false,
        }}
        onMapLoaded={() => setIsMapLoaded(true)}
        markers={[
          ...(selectedOrigin
            ? [
                {
                  coordinates: {
                    latitude: selectedOrigin.latitude,
                    longitude: selectedOrigin.longitude,
                  },
                  title: selectedOrigin.address,
                },
              ]
            : []),
          ...(selectedDestination
            ? [
                {
                  coordinates: {
                    latitude: selectedDestination.latitude,
                    longitude: selectedDestination.longitude,
                  },
                  title: selectedDestination.address,
                },
              ]
            : []),
          // Add completed reports as markers
          ...(nearbyReportsQuery.data?.data || []).map((report) => ({
            id: report.id,
            coordinates: {
              latitude: report.locationGeo.lat,
              longitude: report.locationGeo.lng,
            },
            title: report.title,
            description: report.locationName,
            color: '#10B981', // Green color for completed reports
          })),
        ]}
        polylines={
          routeData?.coordinates
            ? [
                {
                  coordinates: routeData.coordinates,
                  color: '#5572FF',
                  width: 6,
                },
              ]
            : selectedOrigin && selectedDestination && routeError
              ? [
                  {
                    coordinates: [
                      {
                        latitude: selectedOrigin.latitude,
                        longitude: selectedOrigin.longitude,
                      },
                      {
                        latitude: selectedDestination.latitude,
                        longitude: selectedDestination.longitude,
                      },
                    ],
                    color: '#FF5757',
                    width: 5,
                  },
                ]
              : []
        }
      />
      <SafeAreaView className="flex-1" pointerEvents="box-none">
        <MapControls
          selectedOrigin={selectedOrigin}
          selectedDestination={selectedDestination}
          onOriginPress={handleOriginPress}
          onDestinationPress={handleDestinationPress}
        />

        <CurrentLocationButton onPress={handleCurrentLocation} />

        {/* Route Info Badge */}
        {selectedOrigin && selectedDestination && (
          <RouteInfoBadge
            isLoadingRoute={isLoadingRoute}
            routeError={routeError}
            analysisStatus={analysisStatus}
            isResultModalVisible={isResultModalVisible}
            hasRouteData={!!routeData}
            onShowResults={() => setIsResultModalVisible(true)}
          />
        )}
      </SafeAreaView>

      <LocationSearchBottomSheet
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
        mode={searchMode}
        originValue={selectedOrigin}
        destinationValue={selectedDestination}
      />

      {isResultModalVisible && (
        <AnalyzeResultBottomSheet
          visible={isResultModalVisible}
          onClose={() => setIsResultModalVisible(false)}
          status={analysisStatus === 'idle' ? 'loading' : analysisStatus}
          analysis={analysisStatus === 'success' ? (analysisResult ?? undefined) : undefined}
          errorMessage={analysisError}
          onRetry={analysisStatus === 'error' ? handleRetryAnalysis : undefined}
          routeInfo={{
            distance: routeData?.distance,
            duration: routeData?.duration,
          }}
        />
      )}
    </>
  );
}
