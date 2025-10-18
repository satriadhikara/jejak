import type {
  GetUserReportByIdResponse,
  GetUserReportsResponse,
} from '@/utils/types/riwayat.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getUserReports = async (
  cookie: string,
  draft: boolean
): Promise<GetUserReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/reports?draft=${draft}`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user reports');
  }

  return (await response.json()) as GetUserReportsResponse;
};

export const getUserReportById = async (
  cookie: string,
  id: string
): Promise<GetUserReportByIdResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user report by ID');
  }

  return (await response.json()) as GetUserReportByIdResponse;
};

type GetStorageReadUrlResponse = {
  url: string;
};

export const getStorageReadUrl = async (
  cookie: string,
  key: string
): Promise<GetStorageReadUrlResponse> => {
  const params = new URLSearchParams({ key });
  const response = await fetch(`${API_BASE_URL}/api/storage?${params.toString()}`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch storage read URL');
  }

  return (await response.json()) as GetStorageReadUrlResponse;
};
