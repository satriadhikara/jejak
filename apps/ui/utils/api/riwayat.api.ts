import type {
  GetUserReportByIdResponse,
  GetUserReportsResponse,
} from '@/utils/types/riwayat.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getUserReports = async (
  cookie: string,
  draft: boolean
): Promise<GetUserReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/report?draft=${draft}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/report/${id}`, {
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
