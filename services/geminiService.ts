import { GoogleGenAI, Type } from "@google/genai";
import { CurriculumRow } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenAI({ apiKey });
};

export const findSmartMatches = async (
  invalidItems: { nama_mk: string; kode_mk_current: string }[],
  curriculum: CurriculumRow[]
): Promise<Array<{ original_name: string; suggested_code: string; reason: string }>> => {
  try {
    const ai = initGenAI();
    
    // Optimize payload: only send code and name from curriculum to save tokens
    const simplifiedCurriculum = curriculum.map(c => `${c.kode_mk}: ${c.nama_mk}`).join("\n");
    const invalidList = invalidItems.map(i => `Current Code: ${i.kode_mk_current}, Course Name: ${i.nama_mk}`).join("\n");

    const prompt = `
      You are an academic course conversion expert.
      
      Task: Match student courses with invalid codes to the correct course in the target curriculum based on the Course Name (semantic similarity).
      
      Target Curriculum (Format: "Code: Name"):
      ---
      ${simplifiedCurriculum}
      ---
      
      Invalid Student Courses:
      ---
      ${invalidList}
      ---
      
      Return a JSON array where each object has:
      - "original_name": The exact 'Course Name' from the Invalid list.
      - "suggested_code": The 'Code' from the Target Curriculum that best matches. If no match is found, use "NO_MATCH".
      - "reason": A very short explanation (max 10 words).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original_name: { type: Type.STRING },
              suggested_code: { type: Type.STRING },
              reason: { type: Type.STRING },
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;

  } catch (error) {
    console.error("Gemini matching failed:", error);
    throw error;
  }
};
