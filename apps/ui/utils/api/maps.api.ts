import type { AnalyzeRequest, AnalyzeResponse } from '@/utils/types/maps.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type AnalyzeRouteOptions = {
  signal?: AbortSignal;
};

export const analyzeRoute = async (
  payload: AnalyzeRequest,
  options: AnalyzeRouteOptions = {}
): Promise<AnalyzeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/maps/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Gagal menganalisis rute. Coba lagi nanti.';
    throw new Error(message);
  }

  return response.json();
};
