import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return "I'm sorry, but the AI service is currently unavailable (API Key missing). Please try contacting the developer directly.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert history to format expected by chat (excluding the last message which is sent as the new message)
    const chatHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't get a response. Please try again.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};