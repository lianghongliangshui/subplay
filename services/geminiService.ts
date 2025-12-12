import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getGrammarExplanation = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the grammar structure of the following sentence briefly (max 2 sentences) for a language learner. Focus on the key grammatical point or verb tense used: "${text}"`,
      config: {
        systemInstruction: "You are a concise and helpful language tutor. Do not use markdown bolding too heavily. Keep it plain and readable.",
        temperature: 0.3, // Lower temperature for more factual/educational responses
      },
    });
    
    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI service is currently unavailable. Please check your connection or API key.";
  }
};