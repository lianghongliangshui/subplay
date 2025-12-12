import { GoogleGenAI } from "@google/genai";
import { AISettings } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = "You are a concise and helpful language tutor. Provide explanations in Chinese. Do not use markdown bolding too heavily.";

export const getGrammarExplanation = async (text: string, settings?: AISettings): Promise<string> => {
  const userPrompt = `Explain the grammar structure of the following sentence briefly (max 2 sentences) in Chinese. Focus on the key grammatical point or verb tense used: "${text}"`;

  // DeepSeek / OpenAI Compatible Provider
  if (settings?.provider === 'deepseek') {
    if (!settings.deepseekApiKey) {
      return "请在设置中配置 DeepSeek API 密钥。";
    }

    try {
      // Use the provided URL directly as the full endpoint
      const endpoint = settings.deepseekBaseUrl || 'https://api.deepseek.com/chat/completions';
      const model = settings.deepseekModel || 'deepseek-chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "无法从 DeepSeek 获取解释。";
    } catch (error) {
      console.error("DeepSeek API Error:", error);
      return `DeepSeek 错误: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Default: Google Gemini
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });
    
    return response.text || "无法生成解释。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI服务当前不可用，请检查您的连接或API密钥。";
  }
};