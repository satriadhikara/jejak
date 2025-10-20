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

export type AdminReport = {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterImage: string | null;
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

export type GetAllReportsResponse = {
  data: AdminReport[];
};

export type GetAdminReportByIdResponse = {
  data: AdminReport | null;
};

export type UpdateReportStatusPayload = {
  status: ReportStatus;
  statusHistory: StatusHistoryEntry[];
};

export type UpdateReportStatusResponse = {
  data: AdminReport;
};

export type CompleteReportPayload = {
  handlingDescription: string;
  notes?: string;
  completionImages: { key: string }[];
};

export type ReportCompletion = {
  id: string;
  reportId: string;
  handlingDescription: string;
  notes: string | null;
  completionImages: { key: string }[];
  createdAt: string;
};

export type CompleteReportResponse = {
  data: {
    completion: ReportCompletion;
    report: AdminReport;
    pointsAwarded: number;
  };
};
