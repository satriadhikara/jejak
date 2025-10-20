import type {
  DamageCategory,
  GetUserReportByIdResponse,
  GetUserReportsResponse,
  LocationGeo,
  PhotoUrl,
  ReportStatus,
  StatusHistoryEntry,
  UpdateReportPayload,
  UserReport,
  GetNearbyCompletedReportsResponse,
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

type GetStorageUploadUrlResponse = {
  url: string;
  key: string;
  contentType: string;
};

export type CreateReportPayload = {
  title: string;
  locationName: string;
  locationGeo: LocationGeo;
  damageCategory: DamageCategory;
  impactOfDamage?: string;
  description?: string;
  photosUrls: PhotoUrl[];
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
};

type CreateReportResponse = {
  data: UserReport;
};

type UpdateReportResponse = {
  data: UserReport;
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

export const getStorageUploadUrl = async (
  cookie: string,
  fileName: string
): Promise<GetStorageUploadUrlResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/storage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({ fileName }),
  });

  if (!response.ok) {
    throw new Error('Failed to get storage upload URL');
  }

  return (await response.json()) as GetStorageUploadUrlResponse;
};

export const createReport = async (
  cookie: string,
  payload: CreateReportPayload
): Promise<CreateReportResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create report');
  }

  return (await response.json()) as CreateReportResponse;
};

export const updateReport = async (
  cookie: string,
  reportId: string,
  payload: UpdateReportPayload
): Promise<UpdateReportResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update report');
  }

  return (await response.json()) as UpdateReportResponse;
};

export const getNearbyCompletedReports = async (
  cookie: string,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): Promise<GetNearbyCompletedReportsResponse> => {
  const params = new URLSearchParams({
    minLat: bounds.minLat.toString(),
    maxLat: bounds.maxLat.toString(),
    minLng: bounds.minLng.toString(),
    maxLng: bounds.maxLng.toString(),
  });

  const url = `${API_BASE_URL}/api/reports/nearby/completed?${params}`;
  console.log('Fetching nearby reports from:', url);
  console.log('Bounds:', bounds);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch nearby completed reports:', response.status, errorText);
    throw new Error('Failed to fetch nearby completed reports');
  }

  const data = (await response.json()) as GetNearbyCompletedReportsResponse;
  console.log('Received nearby reports:', data);
  return data;
};
