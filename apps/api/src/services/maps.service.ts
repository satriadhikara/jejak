import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { MapsAnalyzeBody } from "@/validators/maps.validator";
import { Buffer } from "buffer";
import type {
  AnalyzeMapsResponseV1,
  AnalysisCard,
  Category,
  GeminiSegmentAnalysis,
  Notice,
  Tone,
  WaypointData,
} from "@/types/maps.types";

// Douglas-Peucker algorithm for route simplification
function douglasPeucker(
  points: Array<{ latitude: number; longitude: number }>,
  epsilon: number,
): Array<{ latitude: number; longitude: number }> {
  if (points.length <= 2) return points;

  // Find the point with maximum perpendicular distance
  let maxDistance = 0;
  let index = 0;

  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon);
    const right = douglasPeucker(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}

function perpendicularDistance(
  point: { latitude: number; longitude: number },
  lineStart: { latitude: number; longitude: number },
  lineEnd: { latitude: number; longitude: number },
): number {
  const dx = lineEnd.longitude - lineStart.longitude;
  const dy = lineEnd.latitude - lineStart.latitude;

  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;

  const u =
    ((point.longitude - lineStart.longitude) * dx +
      (point.latitude - lineStart.latitude) * dy) /
    (mag * mag);

  const intersectionX = lineStart.longitude + u * dx;
  const intersectionY = lineStart.latitude + u * dy;

  const distX = point.longitude - intersectionX;
  const distY = point.latitude - intersectionY;

  return Math.sqrt(distX * distX + distY * distY);
}

// Calculate distance between two coordinates in meters
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Sample waypoints at regular intervals
function sampleWaypoints(
  coordinates: Array<{ latitude: number; longitude: number }>,
  interval: number,
): Array<{ segmentId: string; lat: number; lng: number }> {
  const waypoints: Array<{ segmentId: string; lat: number; lng: number }> = [];
  let accumulatedDistance = 0;
  let segmentCounter = 1;

  waypoints.push({
    segmentId: `seg_${String(segmentCounter).padStart(3, "0")}`,
    lat: coordinates[0].latitude,
    lng: coordinates[0].longitude,
  });
  segmentCounter++;

  for (let i = 1; i < coordinates.length; i++) {
    const dist = haversineDistance(
      coordinates[i - 1].latitude,
      coordinates[i - 1].longitude,
      coordinates[i].latitude,
      coordinates[i].longitude,
    );
    accumulatedDistance += dist;

    if (accumulatedDistance >= interval) {
      waypoints.push({
        segmentId: `seg_${String(segmentCounter).padStart(3, "0")}`,
        lat: coordinates[i].latitude,
        lng: coordinates[i].longitude,
      });
      segmentCounter++;
      accumulatedDistance = 0;
    }
  }

  // Always include the last point
  const lastCoord = coordinates[coordinates.length - 1];
  if (
    waypoints[waypoints.length - 1].lat !== lastCoord.latitude ||
    waypoints[waypoints.length - 1].lng !== lastCoord.longitude
  ) {
    waypoints.push({
      segmentId: `seg_${String(segmentCounter).padStart(3, "0")}`,
      lat: lastCoord.latitude,
      lng: lastCoord.longitude,
    });
  }

  return waypoints;
}

// Check Street View metadata for a single location
async function checkStreetViewMetadata(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<{
  hasCoverage: boolean;
  metadata?: {
    panoId?: string;
    lat?: number;
    lng?: number;
    date?: string;
    distance?: number;
  };
}> {
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=30&key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.status === "OK") {
      return {
        hasCoverage: true,
        metadata: {
          panoId: data.pano_id,
          lat: data.location?.lat,
          lng: data.location?.lng,
          date: data.date,
          distance: haversineDistance(
            lat,
            lng,
            data.location?.lat || lat,
            data.location?.lng || lng,
          ),
        },
      };
    }

    return { hasCoverage: false };
  } catch (_error) {
    // Timeout or network error
    return { hasCoverage: false };
  }
}

// Check coverage for all waypoints with bounded concurrency
async function checkCoverage(
  waypoints: Array<{ segmentId: string; lat: number; lng: number }>,
  apiKey: string,
): Promise<WaypointData[]> {
  const concurrencyLimit = 8;
  const results: WaypointData[] = [];

  for (let i = 0; i < waypoints.length; i += concurrencyLimit) {
    const batch = waypoints.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(async (wp) => {
        const { hasCoverage, metadata } = await checkStreetViewMetadata(
          wp.lat,
          wp.lng,
          apiKey,
        );

        let ageYears: number | undefined;
        if (metadata?.date) {
          const captureDate = new Date(metadata.date);
          const now = new Date();
          ageYears =
            (now.getTime() - captureDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365);
        }

        return {
          segmentId: wp.segmentId,
          lat: wp.lat,
          lng: wp.lng,
          metadata,
          hasCoverage,
          ageYears,
        };
      }),
    );

    results.push(...batchResults);
  }

  return results;
}

const MAX_IMAGERY_SAMPLES = 5;
const HEADING_SAMPLES = [0, 180];

async function fetchStreetViewImageBase64(
  waypoint: WaypointData,
  apiKey: string,
  heading?: number,
): Promise<string | undefined> {
  const params = new URLSearchParams({
    size: "640x640",
    key: apiKey,
    source: "outdoor",
  });

  if (waypoint.metadata?.panoId) {
    params.set("pano", waypoint.metadata.panoId);
  } else {
    params.set("location", `${waypoint.lat},${waypoint.lng}`);
  }

  if (heading !== undefined) {
    params.set("heading", heading.toString());
  }

  const url = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return undefined;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return undefined;
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return base64;
  } catch (_error) {
    return undefined;
  }
}

async function attachStreetViewImagery(
  waypoints: WaypointData[],
  apiKey: string,
  maxSamples = MAX_IMAGERY_SAMPLES,
): Promise<WaypointData[]> {
  if (maxSamples <= 0) return waypoints;

  const cloned = waypoints.map((wp) => ({ ...wp }));
  const indexBySegment = new Map(
    cloned.map((wp, index) => [wp.segmentId, index] as const),
  );

  const candidates = cloned.filter((wp) => wp.hasCoverage);
  if (candidates.length === 0) {
    return cloned;
  }

  const step = Math.max(1, Math.floor(candidates.length / maxSamples));
  const selected: WaypointData[] = [];
  for (
    let i = 0;
    i < candidates.length && selected.length < maxSamples;
    i += step
  ) {
    selected.push(candidates[i]);
  }
  if (
    selected.length < maxSamples &&
    !selected.includes(candidates[candidates.length - 1])
  ) {
    selected.push(candidates[candidates.length - 1]);
  }

  for (const waypoint of selected) {
    const images: NonNullable<WaypointData["images"]> = [];

    for (const heading of HEADING_SAMPLES) {
      const base64 = await fetchStreetViewImageBase64(
        waypoint,
        apiKey,
        heading,
      );
      if (base64) {
        images.push({
          heading,
          mimeType: "image/jpeg",
          data: base64,
        });
      }
    }

    if (images.length === 0) {
      const fallback = await fetchStreetViewImageBase64(waypoint, apiKey);
      if (fallback) {
        images.push({
          mimeType: "image/jpeg",
          data: fallback,
        });
      }
    }

    if (images.length > 0) {
      const index = indexBySegment.get(waypoint.segmentId);
      if (index !== undefined) {
        cloned[index] = { ...cloned[index], images };
      }
    }
  }

  return cloned;
}

// Calculate coverage statistics
function calculateCoverageStats(waypoints: WaypointData[]): {
  coveragePercent: number;
  recencyBucket: "<=1y" | "1-3y" | ">3y" | "unknown";
  stalePercent: number;
} {
  const totalWaypoints = waypoints.length;
  const coveredWaypoints = waypoints.filter((wp) => wp.hasCoverage).length;
  const coveragePercent = Math.round((coveredWaypoints / totalWaypoints) * 100);

  // Calculate recency
  const agesKnown = waypoints.filter((wp) => wp.ageYears !== undefined);
  let recencyBucket: "<=1y" | "1-3y" | ">3y" | "unknown" = "unknown";

  if (agesKnown.length > 0) {
    const avgAge =
      agesKnown.reduce((sum, wp) => sum + (wp.ageYears || 0), 0) /
      agesKnown.length;
    if (avgAge <= 1) recencyBucket = "<=1y";
    else if (avgAge <= 3) recencyBucket = "1-3y";
    else recencyBucket = ">3y";
  }

  // Calculate stale percentage
  const staleWaypoints = waypoints.filter(
    (wp) => (wp.ageYears || 0) > 3,
  ).length;
  const stalePercent = Math.round((staleWaypoints / totalWaypoints) * 100);

  return { coveragePercent, recencyBucket, stalePercent };
}

// Use Gemini to analyze the route
async function analyzeWithGemini(
  waypoints: WaypointData[],
  routeDistance: number,
  apiKey: string,
): Promise<GeminiSegmentAnalysis[]> {
  const genAI = new GoogleGenAI({
    apiKey,
  });

  const prompt = `Anda adalah asisten analisis aksesibilitas pejalan kaki. Berdasarkan metadata dan foto Street View berikut untuk rute ${Math.round(routeDistance)} meter, berikan penilaian per kategori.

Data waypoints:
${waypoints
  .map(
    (wp) =>
      `- ${wp.segmentId}: ${
        wp.hasCoverage
          ? `coverage ada, usia ${wp.ageYears?.toFixed(1)}y`
          : "tidak ada coverage"
      }`,
  )
  .join("\n")}

Gunakan juga foto yang disediakan (label "Foto segmen <id> heading <derajat>") untuk memperkaya penilaian. Berikan skor 0-100 untuk setiap kategori berikut:
- accessibility: apakah ramah disabilitas (ramp, guiding block)
- sidewalk: kualitas trotoar (lebar, permukaan)
- lighting: penerangan jalan
- crossing: fasilitas penyeberangan
- obstruction: hambatan (kendaraan parkir, pohon)
- traffic: lalu lintas kendaraan
- wayfinding: rambu/petunjuk arah

Respons dalam format JSON array:
[{"segmentId": "seg_001", "accessibility": 70, "sidewalk": 65, "lighting": 55, "crossing": 60, "obstruction": 50, "traffic": 60, "wayfinding": 40}]

Hanya kembalikan JSON array, tanpa teks tambahan.`;

  const imageWaypoints = waypoints.filter((wp) => (wp.images?.length || 0) > 0);
  const parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [{ text: prompt }];

  imageWaypoints.forEach((wp) => {
    wp.images?.forEach((image, idx) => {
      const headingLabel =
        image.heading !== undefined ? ` heading ${image.heading}°` : "";
      const indexLabel =
        wp.images && wp.images.length > 1 && image.heading === undefined
          ? ` #${idx + 1}`
          : "";
      parts.push({
        text: `Foto segmen ${wp.segmentId}${headingLabel}${indexLabel}`,
      });
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    });
  });

  // console.log("Step 3.0: Gemini analysis, parts: ", parts);

  try {
    // const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 3000);

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.2,
      },
    });

    // clearTimeout(timeoutId);

    // console.log("Step 3.1: Gemini analysis", JSON.stringify(result));

    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text?.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    // console.log("Step 3.2: Gemini analysis", jsonMatch[0]);

    const parsed = JSON.parse(jsonMatch[0]);
    // console.log("Step 3.3: Gemini analysis", parsed);
    return parsed;
  } catch (error) {
    console.error("Error Gemini:", error);
    throw new Error("MODEL_FAILURE");
  }
}

// Generate analysis cards from Gemini results
function generateCards(
  analyses: GeminiSegmentAnalysis[],
  isIndonesian: boolean,
): AnalysisCard[] {
  const cards: AnalysisCard[] = [];

  // Aggregate scores per category
  const categoryScores: Record<Category, number[]> = {
    accessibility: [],
    sidewalk: [],
    lighting: [],
    crossing: [],
    obstruction: [],
    traffic: [],
    wayfinding: [],
  };

  analyses.forEach((analysis) => {
    if (analysis.accessibility !== undefined)
      categoryScores.accessibility.push(analysis.accessibility);
    if (analysis.sidewalk !== undefined)
      categoryScores.sidewalk.push(analysis.sidewalk);
    if (analysis.lighting !== undefined)
      categoryScores.lighting.push(analysis.lighting);
    if (analysis.crossing !== undefined)
      categoryScores.crossing.push(analysis.crossing);
    if (analysis.obstruction !== undefined)
      categoryScores.obstruction.push(analysis.obstruction);
    if (analysis.traffic !== undefined)
      categoryScores.traffic.push(analysis.traffic);
    if (analysis.wayfinding !== undefined)
      categoryScores.wayfinding.push(analysis.wayfinding);
  });

  // Create cards for categories with data
  const categoryMeta: Record<
    Category,
    { titleId: string; titleEn: string; getDesc: (score: number) => string }
  > = {
    accessibility: {
      titleId: "Disabilitas friendly",
      titleEn: "Disability friendly",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Terdapat ramp dan guiding block di beberapa titik."
            : "Ramps and guiding blocks available at several points.";
        if (score >= 50)
          return isIndonesian
            ? "Beberapa fasilitas aksesibilitas tersedia namun tidak konsisten."
            : "Some accessibility features available but inconsistent.";
        return isIndonesian
          ? "Fasilitas aksesibilitas sangat minim."
          : "Limited or no accessibility features.";
      },
    },
    sidewalk: {
      titleId: "Trotoar cukup aksesibel",
      titleEn: "Sidewalk accessibility",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Lebar memadai dan permukaan rata."
            : "Adequate width and smooth surface.";
        if (score >= 50)
          return isIndonesian
            ? "Lebar memadai namun ada permukaan tidak rata yang berisiko tersandung."
            : "Adequate width but uneven surface poses trip hazard.";
        return isIndonesian
          ? "Trotoar sempit atau rusak parah."
          : "Narrow or severely damaged sidewalk.";
      },
    },
    lighting: {
      titleId: "Ada penerangan",
      titleEn: "Lighting available",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Lampu jalan tersedia dengan baik di sepanjang rute."
            : "Street lights well-distributed along the route.";
        if (score >= 50)
          return isIndonesian
            ? "Lampu jalan ada; satu segmen cenderung gelap."
            : "Street lights present; one segment tends to be dark.";
        return isIndonesian
          ? "Penerangan sangat minim."
          : "Very limited lighting.";
      },
    },
    crossing: {
      titleId: "Fasilitas penyeberangan",
      titleEn: "Crossing facilities",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Zebra cross dan traffic light tersedia."
            : "Crosswalks and traffic lights available.";
        if (score >= 50)
          return isIndonesian
            ? "Beberapa titik penyeberangan namun tidak lengkap."
            : "Some crossing points but incomplete.";
        return isIndonesian
          ? "Sangat minim fasilitas penyeberangan."
          : "Very limited crossing facilities.";
      },
    },
    obstruction: {
      titleId: "Ada penghalang",
      titleEn: "Obstructions present",
      getDesc: (score) => {
        if (score < 50)
          return isIndonesian
            ? "Kendaraan parkir dan pohon menghalangi sebagian trotoar."
            : "Parked vehicles and trees obstruct parts of the sidewalk.";
        if (score < 70)
          return isIndonesian
            ? "Beberapa penghalang kecil di beberapa titik."
            : "Minor obstructions at some points.";
        return isIndonesian
          ? "Jalur relatif bebas hambatan."
          : "Path relatively clear.";
      },
    },
    traffic: {
      titleId: "Lalu lintas",
      titleEn: "Traffic",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Lalu lintas ringan, aman untuk pejalan kaki."
            : "Light traffic, safe for pedestrians.";
        if (score >= 50)
          return isIndonesian
            ? "Lalu lintas sedang, perlu hati-hati saat menyeberang."
            : "Moderate traffic, caution needed when crossing.";
        return isIndonesian
          ? "Lalu lintas padat, risiko tinggi."
          : "Heavy traffic, high risk.";
      },
    },
    wayfinding: {
      titleId: "Rambu petunjuk",
      titleEn: "Wayfinding signs",
      getDesc: (score) => {
        if (score >= 70)
          return isIndonesian
            ? "Rambu jelas dan mudah diikuti."
            : "Clear and easy to follow signs.";
        if (score >= 50)
          return isIndonesian
            ? "Beberapa rambu tersedia."
            : "Some signs available.";
        return isIndonesian
          ? "Sangat minim rambu petunjuk."
          : "Very limited wayfinding signs.";
      },
    },
  };

  const categories = Object.keys(categoryScores) as Category[];
  const cardCandidates: Array<{
    category: Category;
    score: number;
    tone: Tone;
  }> = [];

  categories.forEach((category) => {
    const scores = categoryScores[category];
    if (scores.length === 0) return;

    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );

    let tone: Tone = "neutral";
    if (category === "obstruction") {
      // Inverted logic for obstruction
      if (avgScore < 40) tone = "danger";
      else if (avgScore < 60) tone = "warning";
      else if (avgScore < 75) tone = "neutral";
      else tone = "positive";
    } else {
      if (avgScore >= 75) tone = "positive";
      else if (avgScore >= 60) tone = "neutral";
      else if (avgScore >= 40) tone = "warning";
      else tone = "danger";
    }

    cardCandidates.push({ category, score: avgScore, tone });
  });

  // Prioritize: at least one positive, then warnings/dangers, then neutrals
  cardCandidates.sort((a, b) => {
    const toneOrder = { positive: 0, danger: 1, warning: 2, neutral: 3 };
    return toneOrder[a.tone] - toneOrder[b.tone];
  });

  // Select 3-6 cards
  const selectedCards = cardCandidates.slice(0, 6);

  selectedCards.forEach((candidate, index) => {
    const meta = categoryMeta[candidate.category];
    cards.push({
      id: `c_${candidate.category.substring(0, 6)}_${index + 1}`,
      category: candidate.category,
      title: isIndonesian ? meta.titleId : meta.titleEn,
      description: meta.getDesc(candidate.score),
      tone: candidate.tone,
      score: candidate.score,
      confidence: 0.75,
    });
  });

  return cards;
}

// Calculate overall summary
function calculateSummary(
  cards: AnalysisCard[],
  coveragePercent: number,
  stalePercent: number,
): {
  label: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
  score: number;
  confidence: number;
} {
  if (cards.length === 0) {
    return { label: "Very Poor", score: 0, confidence: 0 };
  }

  // Weighted average
  const weights: Record<Category, number> = {
    sidewalk: 0.25,
    crossing: 0.2,
    accessibility: 0.15,
    lighting: 0.15,
    traffic: 0.15,
    wayfinding: 0.05,
    obstruction: 0.05,
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  cards.forEach((card) => {
    const weight = weights[card.category] || 0.05;
    totalWeightedScore += (card.score || 0) * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) {
    return { label: "Very Poor", score: 0, confidence: 0 };
  }

  const score = Math.round(totalWeightedScore / totalWeight);

  let label: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
  if (score >= 85) label = "Excellent";
  else if (score >= 70) label = "Good";
  else if (score >= 55) label = "Fair";
  else if (score >= 40) label = "Poor";
  else label = "Very Poor";

  const stalePenalty = stalePercent / 100;
  const avgCardConfidence =
    cards.reduce((sum, c) => sum + (c.confidence || 0.75), 0) / cards.length;
  const confidence = Number(
    (
      avgCardConfidence *
      (coveragePercent / 100) *
      (1 - stalePenalty * 0.5)
    ).toFixed(2),
  );

  return { label, score, confidence };
}

// Generate request fingerprint
function generateFingerprint(body: MapsAnalyzeBody): string {
  const data = JSON.stringify({
    origin: body.origin,
    destination: body.destination,
    coords: body.route.coordinates.length,
  });
  const hash = Bun.hash(data);
  return hash.toString(16);
}

// Generate runId
function generateRunId(): string {
  const timestamp = new Date().toISOString();
  const random = Math.random().toString(36).substring(2, 7);
  return `an_${timestamp}_${random}`;
}

export const createMapsService = () => {
  const analyze = async (
    body: MapsAnalyzeBody,
  ): Promise<AnalyzeMapsResponseV1> => {
    const startTime = Date.now();
    const runId = generateRunId();

    try {
      // Step 1: Resample/Simplify route
      const epsilon = 0.0001; // ~11m tolerance for Douglas-Peucker
      const simplified = douglasPeucker(body.route.coordinates, epsilon);

      // Determine sampling interval (urban: 80-120m, fallback: 150-200m)
      const routeLength = body.route.distance;
      const interval = routeLength < 2000 ? 100 : 175; // meters

      const waypoints = sampleWaypoints(simplified, interval);

      console.log("Step 1: Resample/Simplify route", simplified, waypoints);

      // Step 2: Check Street View coverage
      const coverageData = await checkCoverage(
        waypoints,
        env.GOOGLE_MAPS_API_KEY,
      );

      const { coveragePercent, recencyBucket, stalePercent } =
        calculateCoverageStats(coverageData);

      // Check for NO_IMAGERY
      if (coveragePercent === 0) {
        return {
          status: "error",
          code: "NO_IMAGERY",
          message: "Street View tidak ditemukan dalam jarak 30 m dari rute.",
          meta: { runId, version: "1.0.0" },
        };
      }

      console.log("Step 2: Check Street View coverage", coverageData);

      const coverageWithImagery = await attachStreetViewImagery(
        coverageData,
        env.GOOGLE_MAPS_API_KEY,
      );

      // Step 3: Gemini analysis
      let geminiAnalyses: GeminiSegmentAnalysis[];
      try {
        geminiAnalyses = await analyzeWithGemini(
          coverageWithImagery,
          body.route.distance,
          env.GEMINI_API_KEY,
        );
      } catch (_error) {
        return {
          status: "error",
          code: "MODEL_FAILURE",
          message: "Gagal menganalisis rute dengan AI.",
          meta: { runId, version: "1.0.0" },
        };
      }

      if (geminiAnalyses.length === 0) {
        return {
          status: "error",
          code: "MODEL_FAILURE",
          message: "Gagal menganalisis rute dengan AI.",
          meta: { runId, version: "1.0.0" },
        };
      }

      // Step 4: Generate cards
      const isIndonesian = body.origin.label?.match(/[а-яА-Я\u0100-\u017F]/)
        ? false
        : true;
      const cards = generateCards(geminiAnalyses, isIndonesian);

      if (cards.length === 0) {
        return {
          status: "error",
          code: "MODEL_FAILURE",
          message: "Gagal menganalisis rute dengan AI.",
          meta: { runId, version: "1.0.0" },
        };
      }

      // Step 5: Calculate summary
      const summary = calculateSummary(cards, coveragePercent, stalePercent);

      // Step 6: Generate notices
      const notices: Notice[] = [];
      if (coveragePercent < 60) {
        notices.push({
          code: "LOW_COVERAGE",
          severity: "warning",
          message: `Street View tidak tersedia pada ${100 - coveragePercent}% rute; hasil mungkin kurang akurat.`,
        });
      }
      if (stalePercent > 30) {
        notices.push({
          code: "STALE_IMAGERY",
          severity: "warning",
          message: `${stalePercent}% waypoint memiliki imagery >3 tahun; kondisi mungkin berbeda.`,
        });
      }

      const took_ms = Date.now() - startTime;

      return {
        status: "ok",
        summary: {
          ...summary,
          coveragePercent,
          recencyBucket,
        },
        cards: cards.slice(0, 6), // Max 6 cards
        notices: notices.length > 0 ? notices : undefined,
        meta: {
          runId,
          version: "1.0.0",
          model: "gemini-2.5-flash",
          took_ms,
          requestFingerprint: generateFingerprint(body),
        },
      };
    } catch (_error) {
      // Handle unexpected errors
      return {
        status: "error",
        code: "INTERNAL",
        message: "Terjadi kesalahan internal saat menganalisis rute.",
        meta: { runId, version: "1.0.0" },
      };
    }
  };

  return {
    analyze,
  };
};

const mapsService = createMapsService();

export async function analyze(
  body: MapsAnalyzeBody,
): Promise<AnalyzeMapsResponseV1> {
  return mapsService.analyze(body);
}
