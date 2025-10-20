import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocationPermission() {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const setupLocationPermission = async () => {
      try {
        // First check if permission is already granted
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        if (existingStatus === 'granted') {
          setHasLocationPermission(true);
          return;
        }

        // If not granted, request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');

        if (status !== 'granted') {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error setting up location permission:', error);
        setHasLocationPermission(false);
      }
    };

    setupLocationPermission();
  }, []);

  return hasLocationPermission;
}
