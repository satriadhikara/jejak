import type {
  GetAllReportsResponse,
  GetAdminReportByIdResponse,
  UpdateReportStatusPayload,
  UpdateReportStatusResponse,
  CompleteReportPayload,
  CompleteReportResponse,
} from '@/utils/types/admin.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getAllReports = async (cookie: string): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all reports');
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getNewReports = async (cookie: string): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/new`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch new reports');
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getInProgressReports = async (cookie: string): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/in-progress`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch in-progress reports');
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getCompletedReports = async (cookie: string): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/completed`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch completed reports');
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getStaleReports = async (cookie: string): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/stale`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stale reports');
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getAdminReportById = async (
  cookie: string,
  reportId: string
): Promise<GetAdminReportByIdResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}`, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch report details');
  }

  return (await response.json()) as GetAdminReportByIdResponse;
};

export const updateReportStatus = async (
  cookie: string,
  reportId: string,
  payload: UpdateReportStatusPayload
): Promise<UpdateReportStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update report status');
  }

  return (await response.json()) as UpdateReportStatusResponse;
};

export const completeReport = async (
  cookie: string,
  reportId: string,
  payload: CompleteReportPayload
): Promise<CompleteReportResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to complete report');
  }

  return (await response.json()) as CompleteReportResponse;
};
