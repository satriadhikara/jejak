import type { GetAllReportsResponse } from "@/utils/types/admin.types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getAllReports = async (
  cookie: string,
): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports`, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch all reports");
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getNewReports = async (
  cookie: string,
): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/new`, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch new reports");
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getInProgressReports = async (
  cookie: string,
): Promise<GetAllReportsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/reports/in-progress`,
    {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch in-progress reports");
  }

  return (await response.json()) as GetAllReportsResponse;
};

export const getCompletedReports = async (
  cookie: string,
): Promise<GetAllReportsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/reports/completed`, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch completed reports");
  }

  return (await response.json()) as GetAllReportsResponse;
};
