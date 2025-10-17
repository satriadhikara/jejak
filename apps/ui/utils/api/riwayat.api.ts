const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const getUserReports = async (cookie: string) => {
  const response = await fetch(`${API_BASE_URL}/api/report`, {
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user reports");
  }

  return response.json();
};
