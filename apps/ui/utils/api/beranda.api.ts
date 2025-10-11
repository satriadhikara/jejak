import { UserPointsResponse, TopUsersByPointsResponse } from '@/utils/types/beranda.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getUserPoints = async (cookies: string): Promise<UserPointsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/points/user`, {
    headers: {
      Cookie: cookies,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user points');
  }

  return response.json();
};

export const getTopUsersByPoints = async (
  cookies: string,
  limit: number = 3
): Promise<TopUsersByPointsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/points/top?limit=${limit}`, {
    headers: {
      Cookie: cookies,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch top users');
  }

  return response.json();
};
