import { useCallback, useRef } from 'react';

interface CameraConfig {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  tilt?: number;
  bearing?: number;
  animationDuration?: number;
}

export function useCameraManager(mapRef: React.RefObject<any>) {
  const pendingCameraUpdate = useRef<CameraConfig | null>(null);
  const lastAppliedCameraConfig = useRef<CameraConfig | null>(null);

  const cameraConfigsAreEqual = useCallback(
    (first: CameraConfig | null, second: CameraConfig | null) => {
      if (!first || !second) {
        return false;
      }

      const firstCoordinates = first.coordinates;
      const secondCoordinates = second.coordinates;

      const coordinatesMatch =
        firstCoordinates &&
        secondCoordinates &&
        firstCoordinates.latitude === secondCoordinates.latitude &&
        firstCoordinates.longitude === secondCoordinates.longitude;

      return (
        coordinatesMatch &&
        first.zoom === second.zoom &&
        first.tilt === second.tilt &&
        first.bearing === second.bearing
      );
    },
    []
  );

  const isCameraAnimationCancellation = (error: unknown): boolean => {
    const containsCancellation = (value: unknown): boolean => {
      if (!value) {
        return false;
      }

      if (typeof value === 'string') {
        return value.toLowerCase().includes('cancel');
      }

      if (typeof value === 'object') {
        const objectValue = value as { message?: unknown; cause?: unknown };
        if (containsCancellation(objectValue.message)) {
          return true;
        }
        if (containsCancellation(objectValue.cause)) {
          return true;
        }
      }

      return String(value).toLowerCase().includes('cancel');
    };

    return containsCancellation(error);
  };

  const applyCameraPosition = useCallback((config: CameraConfig) => {
    if (!mapRef.current) {
      pendingCameraUpdate.current = config;
      return;
    }

    try {
      const maybePromise = mapRef.current.setCameraPosition(config);

      if (
        maybePromise &&
        typeof maybePromise === 'object' &&
        typeof (maybePromise as Promise<void>).then === 'function' &&
        typeof (maybePromise as Promise<void>).catch === 'function'
      ) {
        (maybePromise as Promise<void>).catch((error: unknown) => {
          if (isCameraAnimationCancellation(error)) {
            return;
          }
          console.error('Failed to set camera position:', error);
        });
      }

      lastAppliedCameraConfig.current = config;
    } catch (error) {
      if (isCameraAnimationCancellation(error)) {
        return;
      }
      console.error('Failed to set camera position:', error);
    }
  }, []);

  const flushPendingCameraUpdate = useCallback(
    (isMapLoaded: boolean) => {
      if (!isMapLoaded || !mapRef.current || !pendingCameraUpdate.current) {
        return;
      }

      const config = pendingCameraUpdate.current;
      pendingCameraUpdate.current = null;
      applyCameraPosition(config);
    },
    [applyCameraPosition]
  );

  const setCameraPositionSafely = useCallback(
    (config: CameraConfig) => {
      const normalizedConfig = {
        ...config,
        animationDuration: config?.animationDuration ?? 0,
      };

      if (
        (pendingCameraUpdate.current &&
          cameraConfigsAreEqual(pendingCameraUpdate.current, normalizedConfig)) ||
        (lastAppliedCameraConfig.current &&
          cameraConfigsAreEqual(lastAppliedCameraConfig.current, normalizedConfig))
      ) {
        return;
      }

      pendingCameraUpdate.current = normalizedConfig;
      flushPendingCameraUpdate(!!mapRef.current);
    },
    [cameraConfigsAreEqual, flushPendingCameraUpdate]
  );

  const cleanup = useCallback(() => {
    pendingCameraUpdate.current = null;
    lastAppliedCameraConfig.current = null;
  }, []);

  return {
    setCameraPositionSafely,
    flushPendingCameraUpdate,
    cleanup,
  };
}
