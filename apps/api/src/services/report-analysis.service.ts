import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import type { DamageCategory } from "@/types/report.types";

export type ImageAnalysisResult = {
  title: string;
  damageCategory: DamageCategory;
  hasImpact: boolean;
  impactDescription?: string;
  notes?: string;
};

export async function analyzeReportImage(
  imageData: string,
  mimeType: string,
): Promise<ImageAnalysisResult> {
  const genAI = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  const prompt = `Anda adalah asisten analisis kerusakan infrastruktur jalan. Analisis foto kerusakan jalan berikut dan berikan penilaian dalam format JSON.

Tentukan:
1. title: Judul laporan yang deskriptif (maksimal 50 karakter, dalam Bahasa Indonesia)
2. damageCategory: Tingkat kerusakan ("berat", "sedang", atau "ringan")
   - "berat": Kerusakan parah yang membahayakan, lubang besar, jalan amblas, struktur rusak berat
   - "sedang": Kerusakan menengah yang mengganggu, retak-retak, permukaan tidak rata
   - "ringan": Kerusakan kecil, cat pudar, retakan kecil, permukaan sedikit aus
3. hasImpact: Apakah kerusakan ini menimbulkan dampak pada pengguna jalan? (boolean)
4. impactDescription: Jika hasImpact true, jelaskan dampaknya dalam 1-2 kalimat (maksimal 100 karakter)
5. notes: Catatan tambahan mengenai kondisi dan rekomendasi perbaikan (maksimal 150 karakter)

Respons dalam format JSON:
{
  "title": "Lubang Besar di Jalan Raya",
  "damageCategory": "berat",
  "hasImpact": true,
  "impactDescription": "Membahayakan pengendara motor dan dapat merusak kendaraan",
  "notes": "Perlu segera ditangani, berada di jalur utama dengan lalu lintas tinggi"
}

Hanya kembalikan JSON object, tanpa teks tambahan atau markdown code block.`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const parsed = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;

    // Validate the response
    if (!parsed.title || !parsed.damageCategory) {
      throw new Error("Incomplete analysis result from Gemini");
    }

    // Ensure damageCategory is valid
    if (!["berat", "sedang", "ringan"].includes(parsed.damageCategory)) {
      parsed.damageCategory = "sedang"; // Default to medium if invalid
    }

    return parsed;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("AI_ANALYSIS_FAILED");
  }
}
