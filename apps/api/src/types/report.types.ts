export type ReportStatus =
  | "draft"
  | "diperiksa"
  | "dikonfirmasi"
  | "dalam_penanganan"
  | "selesai"
  | "ditolak";

export type DamageCategory = "berat" | "sedang" | "ringan";

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

export type CreateReportInput = {
  userId: string;
  reportId: string;
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
