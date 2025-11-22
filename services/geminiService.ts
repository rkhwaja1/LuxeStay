import { GoogleGenAI } from "@google/genai";
import { ServiceItem } from "../types";

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is set.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getConciergeRecommendation = async (
  query: string, 
  availableServices: ServiceItem[]
): Promise<string> => {
  if (!apiKey) return "I can't provide AI recommendations without an API key, but feel free to browse our catalog!";

  try {
    const serviceContext = availableServices.map(s => 
      `ID: ${s.id}, Name: ${s.title}, Category: ${s.categoryId}, Price: $${s.price}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a high-end hotel concierge. 
        The guest asked: "${query}".
        
        Here are the available services:
        ${serviceContext}
        
        Recommend 1-2 specific services from the list that best match their request. 
        Be brief, polite, and sound luxurious.
        Format the output as a short conversational paragraph.
      `,
    });

    return response.text || "I couldn't find a perfect match, but please explore our catalog below.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our digital concierge is momentarily unavailable. Please browse the categories below.";
  }
};