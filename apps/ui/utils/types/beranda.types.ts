export interface UserPointsResponse {
  data: {
    points: number;
    rank: number;
  };
}

export interface TopUsersByPointsResponse {
  data: {
    id: string;
    name: string;
    image: string;
    points: number;
  }[];
}

export interface TopUsersByPointsItem {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  isCurrentUser: boolean;
}

export interface ReportHistoryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  statusColor: string;
  statusBgColor: string;
  reporterName?: string;
  reporterImage?: string;
  severity?: 'Ringan' | 'Sedang' | 'Berat';
}
