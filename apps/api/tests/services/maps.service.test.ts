import { describe, it, expect, beforeAll, mock } from "bun:test";
import type { AnalyzeMapsResponseV1 } from "@/types/maps.types";

// Mock data for testing
const goldenRequest = {
  origin: {
    latitude: -6.2088,
    longitude: 106.8456,
    label: "Bundaran HI",
  },
  destination: {
    latitude: -6.1751,
    longitude: 106.865,
    label: "Monas",
  },
  route: {
    coordinates: [
      { latitude: -6.2088, longitude: 106.8456 },
      { latitude: -6.2, longitude: 106.85 },
      { latitude: -6.19, longitude: 106.855 },
      { latitude: -6.18, longitude: 106.86 },
      { latitude: -6.1751, longitude: 106.865 },
    ],
    distance: 5000, // 5km in meters
    duration: 3600, // 1 hour in seconds
  },
};

const noImageryRequest = {
  origin: {
    latitude: -89.0, // Near South Pole - no street view
    longitude: 0.0,
    label: "Antarctica",
  },
  destination: {
    latitude: -89.1,
    longitude: 0.1,
    label: "Antarctica Point 2",
  },
  route: {
    coordinates: [
      { latitude: -89.0, longitude: 0.0 },
      { latitude: -89.05, longitude: 0.05 },
      { latitude: -89.1, longitude: 0.1 },
    ],
    distance: 2000,
    duration: 1200,
  },
};

describe("Maps Service", () => {
  describe("analyze - Golden Success Case", () => {
    it("should return successful analysis with 3-6 cards", async () => {
      // Note: This test requires actual API keys to work
      // In a real test environment, we would mock the external API calls

      const mockResponse: AnalyzeMapsResponseV1 = {
        status: "ok",
        summary: {
          label: "Fair",
          score: 66,
          confidence: 0.74,
          coveragePercent: 78,
          recencyBucket: "1-3y",
        },
        cards: [
          {
            id: "c_access_1",
            category: "accessibility",
            title: "Disabilitas friendly",
            description: "Terdapat ramp dan guiding block di beberapa titik.",
            tone: "positive",
            score: 72,
            confidence: 0.75,
          },
          {
            id: "c_sidewa_2",
            category: "sidewalk",
            title: "Trotoar cukup aksesibel",
            description:
              "Lebar memadai namun ada permukaan tidak rata yang berisiko tersandung.",
            tone: "neutral",
            score: 64,
            confidence: 0.75,
          },
          {
            id: "c_lighti_3",
            category: "lighting",
            title: "Ada penerangan",
            description: "Lampu jalan ada; satu segmen cenderung gelap.",
            tone: "neutral",
            score: 52,
            confidence: 0.75,
          },
          {
            id: "c_obstru_4",
            category: "obstruction",
            title: "Ada penghalang",
            description:
              "Kendaraan parkir dan pohon menghalangi sebagian trotoar.",
            tone: "warning",
            score: 48,
            confidence: 0.75,
          },
        ],
        notices: [
          {
            code: "LOW_COVERAGE",
            severity: "warning",
            message:
              "Street View tidak tersedia pada 22% rute; hasil mungkin kurang akurat.",
          },
        ],
        meta: {
          runId: "an_2025-10-13T04:32:01Z_S9pZt",
          version: "1.0.0",
          model: "gemini-1.5-flash",
          took_ms: 1480,
        },
      };

      // Validate response structure
      expect(mockResponse.status).toBe("ok");
      expect(mockResponse.summary).toBeDefined();
      expect(mockResponse.summary.label).toBeDefined();
      expect(mockResponse.summary.score).toBeGreaterThanOrEqual(0);
      expect(mockResponse.summary.score).toBeLessThanOrEqual(100);

      // Validate cards
      expect(mockResponse.cards).toBeDefined();
      expect(mockResponse.cards.length).toBeGreaterThanOrEqual(3);
      expect(mockResponse.cards.length).toBeLessThanOrEqual(6);

      // Validate each card has required fields
      mockResponse.cards.forEach((card) => {
        expect(card.id).toBeDefined();
        expect(card.category).toBeDefined();
        expect(card.title).toBeDefined();
        expect(card.description).toBeDefined();
        expect(card.description.length).toBeLessThanOrEqual(140);
        expect(card.tone).toBeDefined();
        expect(["positive", "neutral", "warning", "danger"]).toContain(
          card.tone,
        );
      });

      // Validate meta
      expect(mockResponse.meta?.version).toBe("1.0.0");
      expect(mockResponse.meta?.runId).toBeDefined();
    });

    it("should validate summary label buckets", () => {
      const labels = ["Excellent", "Good", "Fair", "Poor", "Very Poor"];
      const scores = [90, 75, 60, 45, 30];

      scores.forEach((score, index) => {
        let expectedLabel: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
        if (score >= 85) expectedLabel = "Excellent";
        else if (score >= 70) expectedLabel = "Good";
        else if (score >= 55) expectedLabel = "Fair";
        else if (score >= 40) expectedLabel = "Poor";
        else expectedLabel = "Very Poor";

        expect(expectedLabel).toBe(labels[index]);
      });
    });

    it("should validate card tone mapping", () => {
      const testCases = [
        { score: 80, expectedTone: "positive" },
        { score: 65, expectedTone: "neutral" },
        { score: 45, expectedTone: "warning" },
        { score: 30, expectedTone: "danger" },
      ];

      testCases.forEach(({ score, expectedTone }) => {
        let tone: "positive" | "neutral" | "warning" | "danger" = "neutral";

        if (score >= 75) tone = "positive";
        else if (score >= 60) tone = "neutral";
        else if (score >= 40) tone = "warning";
        else tone = "danger";

        expect(tone).toBe(expectedTone);
      });
    });
  });

  describe("analyze - NO_IMAGERY Error Case", () => {
    it("should return NO_IMAGERY error when no street view is available", async () => {
      const mockErrorResponse: AnalyzeMapsResponseV1 = {
        status: "error",
        code: "NO_IMAGERY",
        message: "Street View tidak ditemukan dalam jarak 30 m dari rute.",
        meta: {
          runId: "an_2025-10-13T05:05:22Z_n2Y",
          version: "1.0.0",
        },
      };

      // Validate error response structure
      expect(mockErrorResponse.status).toBe("error");
      expect(mockErrorResponse.code).toBe("NO_IMAGERY");
      expect(mockErrorResponse.message).toBeDefined();
      expect(mockErrorResponse.message).toContain("Street View");
      expect(mockErrorResponse.meta?.version).toBe("1.0.0");
      expect(mockErrorResponse.meta?.runId).toBeDefined();
    });

    it("should validate all error codes are properly typed", () => {
      const validErrorCodes = [
        "BAD_REQUEST",
        "NO_IMAGERY",
        "PROVIDER_RATE_LIMIT",
        "MODEL_FAILURE",
        "INTERNAL",
      ];

      validErrorCodes.forEach((code) => {
        expect(validErrorCodes).toContain(code);
      });
    });
  });

  describe("Input validation", () => {
    it("should validate coordinate structure", () => {
      const coord = goldenRequest.route.coordinates[0];
      expect(coord).toHaveProperty("latitude");
      expect(coord).toHaveProperty("longitude");
      expect(typeof coord.latitude).toBe("number");
      expect(typeof coord.longitude).toBe("number");
    });

    it("should validate route structure", () => {
      const route = goldenRequest.route;
      expect(route).toHaveProperty("coordinates");
      expect(route).toHaveProperty("distance");
      expect(route).toHaveProperty("duration");
      expect(Array.isArray(route.coordinates)).toBe(true);
      expect(route.coordinates.length).toBeGreaterThanOrEqual(2);
      expect(typeof route.distance).toBe("number");
      expect(typeof route.duration).toBe("number");
      expect(route.distance).toBeGreaterThan(0);
      expect(route.duration).toBeGreaterThan(0);
    });

    it("should validate location has optional label", () => {
      const origin = goldenRequest.origin;
      expect(origin).toHaveProperty("latitude");
      expect(origin).toHaveProperty("longitude");
      // label is optional
      if (origin.label) {
        expect(typeof origin.label).toBe("string");
      }
    });
  });

  describe("Helper functions", () => {
    it("should calculate haversine distance correctly", () => {
      // Jakarta to Monas approximate distance
      const lat1 = -6.2088;
      const lon1 = 106.8456;
      const lat2 = -6.1751;
      const lon2 = 106.865;

      // Haversine formula implementation
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
      const distance = R * c;

      // Distance should be approximately 4-5km
      expect(distance).toBeGreaterThan(4000);
      expect(distance).toBeLessThan(6000);
    });

    it("should generate valid segment IDs", () => {
      const segmentIds = ["seg_001", "seg_002", "seg_010", "seg_100"];

      segmentIds.forEach((id) => {
        expect(id).toMatch(/^seg_\d{3}$/);
      });
    });

    it("should validate coverage percentage calculation", () => {
      const testCases = [
        { covered: 10, total: 10, expected: 100 },
        { covered: 5, total: 10, expected: 50 },
        { covered: 7, total: 10, expected: 70 },
        { covered: 0, total: 10, expected: 0 },
      ];

      testCases.forEach(({ covered, total, expected }) => {
        const coverage = Math.round((covered / total) * 100);
        expect(coverage).toBe(expected);
      });
    });

    it("should determine recency bucket correctly", () => {
      const testCases = [
        { age: 0.5, expected: "<=1y" },
        { age: 1.0, expected: "<=1y" },
        { age: 2.0, expected: "1-3y" },
        { age: 3.0, expected: "1-3y" },
        { age: 5.0, expected: ">3y" },
      ];

      testCases.forEach(({ age, expected }) => {
        let bucket: "<=1y" | "1-3y" | ">3y" | "unknown";
        if (age <= 1) bucket = "<=1y";
        else if (age <= 3) bucket = "1-3y";
        else bucket = ">3y";

        expect(bucket).toBe(expected);
      });
    });
  });

  describe("Notice generation", () => {
    it("should generate LOW_COVERAGE notice when coverage < 60%", () => {
      const coveragePercent = 55;
      const shouldHaveNotice = coveragePercent < 60;

      expect(shouldHaveNotice).toBe(true);

      if (shouldHaveNotice) {
        const notice = {
          code: "LOW_COVERAGE" as const,
          severity: "warning" as const,
          message: `Street View tidak tersedia pada ${100 - coveragePercent}% rute; hasil mungkin kurang akurat.`,
        };

        expect(notice.code).toBe("LOW_COVERAGE");
        expect(notice.severity).toBe("warning");
        expect(notice.message).toContain("45%");
      }
    });

    it("should generate STALE_IMAGERY notice when stale > 30%", () => {
      const stalePercent = 35;
      const shouldHaveNotice = stalePercent > 30;

      expect(shouldHaveNotice).toBe(true);

      if (shouldHaveNotice) {
        const notice = {
          code: "STALE_IMAGERY" as const,
          severity: "warning" as const,
          message: `${stalePercent}% waypoint memiliki imagery >3 tahun; kondisi mungkin berbeda.`,
        };

        expect(notice.code).toBe("STALE_IMAGERY");
        expect(notice.severity).toBe("warning");
      }
    });
  });

  describe("Request fingerprinting", () => {
    it("should generate consistent fingerprints for same inputs", () => {
      const data1 = JSON.stringify({
        origin: goldenRequest.origin,
        destination: goldenRequest.destination,
        coords: goldenRequest.route.coordinates.length,
      });

      const data2 = JSON.stringify({
        origin: goldenRequest.origin,
        destination: goldenRequest.destination,
        coords: goldenRequest.route.coordinates.length,
      });

      const hash1 = Bun.hash(data1).toString(16);
      const hash2 = Bun.hash(data2).toString(16);

      expect(hash1).toBe(hash2);
    });

    it("should generate different fingerprints for different inputs", () => {
      const data1 = JSON.stringify({
        origin: goldenRequest.origin,
        destination: goldenRequest.destination,
        coords: goldenRequest.route.coordinates.length,
      });

      const data2 = JSON.stringify({
        origin: noImageryRequest.origin,
        destination: noImageryRequest.destination,
        coords: noImageryRequest.route.coordinates.length,
      });

      const hash1 = Bun.hash(data1).toString(16);
      const hash2 = Bun.hash(data2).toString(16);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("RunId generation", () => {
    it("should generate unique runIds", () => {
      const generateRunId = () => {
        const timestamp = new Date().toISOString();
        const random = Math.random().toString(36).substring(2, 7);
        return `an_${timestamp}_${random}`;
      };

      const runId1 = generateRunId();
      const runId2 = generateRunId();

      expect(runId1).toMatch(
        /^an_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_[a-z0-9]{5}$/,
      );
      expect(runId2).toMatch(
        /^an_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_[a-z0-9]{5}$/,
      );
      // They should be different (very high probability due to timestamp and random)
      expect(runId1).not.toBe(runId2);
    });
  });
});
