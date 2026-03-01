import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Simple cache to avoid redundant calls within the same session
const insightCache: Record<string, { result: string; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeDashboardData(data: any, context: string) {
  const cacheKey = `${context}-${JSON.stringify(data)}`;

  // Check cache
  if (insightCache[cacheKey] && (Date.now() - insightCache[cacheKey].timestamp < CACHE_DURATION)) {
    return insightCache[cacheKey].result;
  }

  const prompt = `
    You are a business consultant for a coffee shop. 
    Analyze the following ${context} data and provide 3-4 actionable insights in Thai.
    Keep it concise and professional.
    
    Data: ${JSON.stringify(data)}
  `;

  let result = "";
  const apiKey = process.env.GEMINI_API_KEY || "";

  // 1. Try Gemini if API key is present
  if (apiKey) {
    let retries = 0;
    const maxRetries = 2;
    let delay = 2000;

    while (retries <= maxRetries && !result) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt
        });
        result = response.text || "";
      } catch (error: any) {
        const isQuotaError = error?.message?.includes("429") || error?.status === 429 || JSON.stringify(error).includes("429");
        if (isQuotaError && retries < maxRetries) {
          console.warn(`Gemini quota exceeded. Retrying in ${delay}ms...`);
          await sleep(delay);
          retries++;
          delay *= 2;
          continue;
        }
        console.error("Gemini Error:", error);
        break; // Stop retrying on non-quota errors, fallback below
      }
    }
  }

  // 2. Fallback to free, keyless AI (Pollinations.ai) if Gemini fails or no key is provided
  if (!result) {
    try {
      console.log("Using free AI fallback (Pollinations)...");
      const res = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (res.ok) {
        result = await res.text();
      } else {
        throw new Error(`Pollinations API error: ${res.status}`);
      }
    } catch (error) {
      console.error("Free AI Error:", error);
      return "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้ (ระบบ AI ไม่พร้อมใช้งาน)";
    }
  }

  if (!result) {
    return "ไม่พบข้อมูลเชิงลึก โปรดลองใหม่อีกครั้ง";
  }

  // Store in cache
  insightCache[cacheKey] = { result, timestamp: Date.now() };

  return result;
}
