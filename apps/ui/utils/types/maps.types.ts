export type Tone = 'positive' | 'neutral' | 'warning' | 'danger';

export type Category =
  | 'accessibility'
  | 'sidewalk'
  | 'lighting'
  | 'crossing'
  | 'obstruction'
  | 'traffic'
  | 'wayfinding';

export type AnalysisCard = {
  id: string;
  category: Category;
  title: string;
  description: string;
  tone: Tone;
  score?: number;
  confidence?: number;
  segments?: string[];
  actionText?: string;
};

export type Notice = {
  code: 'LOW_COVERAGE' | 'STALE_IMAGERY' | 'PARTIAL_FAILURE';
  severity: 'info' | 'warning';
  message: string;
};

export type AnalyzeSuccessResponse = {
  status: 'ok';
  summary: {
    label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
    score: number;
    confidence?: number;
    coveragePercent?: number;
    recencyBucket?: '<=1y' | '1-3y' | '>3y' | 'unknown';
  };
  cards: AnalysisCard[];
  notices?: Notice[];
  meta?: {
    runId: string;
    version: '1.0.0';
    model?: string;
    took_ms?: number;
    requestFingerprint?: string;
  };
};

export type AnalyzeErrorCode =
  | 'BAD_REQUEST'
  | 'NO_IMAGERY'
  | 'PROVIDER_RATE_LIMIT'
  | 'MODEL_FAILURE'
  | 'INTERNAL';

export type AnalyzeErrorResponse = {
  status: 'error';
  code: AnalyzeErrorCode;
  message: string;
  meta?: { runId: string; version: '1.0.0' };
};

export type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

export type AnalyzeRequest = {
  origin: {
    latitude: number;
    longitude: number;
    label?: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    label?: string;
  };
  route: {
    coordinates: Array<{ latitude: number; longitude: number }>;
    distance: number;
    duration: number;
  };
};
