export type ReportStatus =
  | 'draft'
  | 'diperiksa'
  | 'dikonfirmasi'
  | 'dalam_penanganan'
  | 'selesai'
  | 'ditolak';

export type DamageCategory = 'berat' | 'sedang' | 'ringan';

export type LocationGeo = {
  lat: number;
  lng: number;
};

export type PhotoUrl = {
  key: string;
};

export type StatusHistoryEntry = {
  status: ReportStatus;
  timestamp: string;
  description: string;
};

export type UserReport = {
  id: string;
  reporterId: string;
  title: string;
  locationName: string;
  locationGeo: LocationGeo;
  damageCategory: DamageCategory;
  impactOfDamage: string | null;
  description: string | null;
  photosUrls: PhotoUrl[];
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
};

export type GetUserReportsResponse = {
  data: UserReport[];
};

export type GetUserReportByIdResponse = {
  data: UserReport | null;
};

export type UpdateReportPayload = {
  title?: string;
  locationName?: string;
  locationGeo?: LocationGeo;
  damageCategory?: DamageCategory;
  impactOfDamage?: string;
  description?: string;
  photosUrls?: PhotoUrl[];
  status?: ReportStatus;
  statusHistory?: StatusHistoryEntry[];
};
