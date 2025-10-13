export type Tone = "positive" | "neutral" | "warning" | "danger";
export type Category =
  | "accessibility"
  | "sidewalk"
  | "lighting"
  | "crossing"
  | "obstruction"
  | "traffic"
  | "wayfinding";

export type AnalysisCard = {
  id: string; // "c_<category>_<n>"
  category: Category;
  title: string; // e.g., "Disabilitas friendly"
  description: string; // <= 140 chars, Bahasa if inputs are Indonesian
  tone: Tone;
  score?: number; // 0..100
  confidence?: number; // 0..1
  segments?: string[]; // optional (for future overlays)
  actionText?: string; // optional CTA
};

export type Notice = {
  code: "LOW_COVERAGE" | "STALE_IMAGERY" | "PARTIAL_FAILURE";
  severity: "info" | "warning";
  message: string;
};

export type AnalyzeMapsResponseV1 =
  | {
      status: "ok";
      summary: {
        label: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
        score: number; // 0..100
        confidence?: number; // 0..1
        coveragePercent?: number; // 0..100
        recencyBucket?: "<=1y" | "1-3y" | ">3y" | "unknown";
      };
      cards: AnalysisCard[]; // 3–6 items
      notices?: Notice[];
      meta?: {
        runId: string;
        version: "1.0.0";
        model?: string;
        took_ms?: number;
        requestFingerprint?: string; // hash of inputs (optional)
      };
    }
  | {
      status: "error";
      code:
        | "BAD_REQUEST"
        | "NO_IMAGERY"
        | "PROVIDER_RATE_LIMIT"
        | "MODEL_FAILURE"
        | "INTERNAL";
      message: string;
      meta?: { runId: string; version: "1.0.0" };
    };

// Internal types for Street View metadata
export type StreetViewMetadata = {
  panoId?: string;
  lat?: number;
  lng?: number;
  date?: string;
  distance?: number;
};

export type WaypointData = {
  segmentId: string;
  lat: number;
  lng: number;
  metadata?: StreetViewMetadata;
  hasCoverage: boolean;
  ageYears?: number;
  images?: Array<{
    heading?: number;
    mimeType: string;
    data: string;
  }>;
};

// Gemini analysis response structure
export type GeminiSegmentAnalysis = {
  segmentId: string;
  accessibility?: number;
  sidewalk?: number;
  lighting?: number;
  crossing?: number;
  obstruction?: number;
  traffic?: number;
  wayfinding?: number;
  notes?: string;
};
