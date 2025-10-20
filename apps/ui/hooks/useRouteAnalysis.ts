import { useCallback, useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDirections } from '@/utils/api/places.api';
import { analyzeRoute } from '@/utils/api/maps.api';
import type { AnalyzeSuccessResponse } from '@/utils/types/maps.types';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationData extends LocationCoords {
  address: string;
  mainText: string;
}

export function useRouteAnalysis(
  selectedOrigin: LocationData | null,
  selectedDestination: LocationData | null,
  cookie: string
) {
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSuccessResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analysisAbortController = useRef<AbortController | null>(null);

  // Fetch route using Google Routes API v2 when both origin and destination are selected
  const {
    data: routeData,
    isLoading: isLoadingRoute,
    error: routeError,
  } = useQuery({
    queryKey: ['routes', selectedOrigin, selectedDestination],
    queryFn: async () => {
      if (!selectedOrigin || !selectedDestination) return null;
      return await getDirections(
        {
          latitude: selectedOrigin.latitude,
          longitude: selectedOrigin.longitude,
        },
        {
          latitude: selectedDestination.latitude,
          longitude: selectedDestination.longitude,
        }
      );
    },
    enabled: !!selectedOrigin && !!selectedDestination,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Clear analysis when origin/destination changes
  useEffect(() => {
    if (!selectedOrigin || !selectedDestination) {
      analysisAbortController.current?.abort();
      analysisAbortController.current = null;
      setAnalysisStatus('idle');
      setAnalysisResult(null);
      setAnalysisError(null);
    }
  }, [selectedOrigin, selectedDestination]);

  const runAnalysis = useCallback(() => {
    if (!selectedOrigin || !selectedDestination || !routeData) {
      return;
    }

    const { distanceMeters, durationSeconds, coordinates } = routeData;

    if (
      typeof distanceMeters !== 'number' ||
      Number.isNaN(distanceMeters) ||
      typeof durationSeconds !== 'number' ||
      Number.isNaN(durationSeconds) ||
      !Array.isArray(coordinates) ||
      coordinates.length === 0
    ) {
      return;
    }

    const controller = new AbortController();
    analysisAbortController.current?.abort();
    analysisAbortController.current = controller;

    setAnalysisStatus('loading');
    setAnalysisResult(null);
    setAnalysisError(null);

    const payload = {
      origin: {
        latitude: selectedOrigin.latitude,
        longitude: selectedOrigin.longitude,
        label: selectedOrigin.mainText || selectedOrigin.address,
      },
      destination: {
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
        label: selectedDestination.mainText || selectedDestination.address,
      },
      route: {
        coordinates: coordinates.map((coord) => ({
          latitude: coord.latitude,
          longitude: coord.longitude,
        })),
        distance: distanceMeters,
        duration: durationSeconds,
      },
    };

    analyzeRoute(payload, { signal: controller.signal }, cookie)
      .then((response) => {
        if (controller.signal.aborted) return;
        if (response.status === 'ok') {
          console.log('[Analyze] Success response', {
            summary: response.summary,
            cardsCount: response.cards?.length ?? 0,
            noticesCount: response.notices?.length ?? 0,
            meta: response.meta,
          });
          setAnalysisStatus('success');
          setAnalysisResult(response);
        } else {
          console.log('[Analyze] Error response', response);
          setAnalysisStatus('error');
          setAnalysisError(response.message);
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error('[Analyze] Request failed', error);
        setAnalysisStatus('error');
        setAnalysisError(error.message ?? 'Gagal menganalisis rute. Coba lagi nanti.');
      });
  }, [routeData, selectedDestination, selectedOrigin]);

  // Automatically run analysis when route data changes
  useEffect(() => {
    if (!selectedOrigin || !selectedDestination) {
      return;
    }

    if (routeError) {
      console.error('[Analyze] Route fetch error, analysis aborted', routeError);
      analysisAbortController.current?.abort();
      analysisAbortController.current = null;
      setAnalysisStatus('error');
      setAnalysisResult(null);
      setAnalysisError('Gagal memuat rute. Analisis tidak dapat dilakukan.');
      return;
    }

    runAnalysis();

    return () => {
      analysisAbortController.current?.abort();
      analysisAbortController.current = null;
    };
  }, [isLoadingRoute, routeData, routeError, runAnalysis, selectedDestination, selectedOrigin]);

  const handleRetryAnalysis = useCallback(() => {
    if (!routeData || isLoadingRoute || routeError) {
      return;
    }
    runAnalysis();
  }, [isLoadingRoute, routeData, routeError, runAnalysis]);

  const cleanup = useCallback(() => {
    analysisAbortController.current?.abort();
    analysisAbortController.current = null;
  }, []);

  return {
    routeData,
    isLoadingRoute,
    routeError,
    analysisStatus,
    analysisResult,
    analysisError,
    handleRetryAnalysis,
    cleanup,
  };
}
