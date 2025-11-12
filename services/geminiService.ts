import { GoogleGenAI, Type } from "@google/genai";
import { LOCAL_STORAGE_API_KEY } from '../constants';

/**
 * Fetches word details directly from the Gemini API using a key from localStorage.
 */
export async function fetchWordDetails(sourceWord: string, sourceLanguage: string, targetLanguage: string): Promise<{ translatedWord: string; definition: string; exampleSentence: string; }> {
  const apiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please set it in the Settings tab.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a concise definition, one example sentence, and a translation for the ${sourceLanguage} word "${sourceWord}" into ${targetLanguage}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    translatedWord: {
                        type: Type.STRING,
                        description: `The translation of the word into ${targetLanguage}.`
                    },
                    definition: {
                        type: Type.STRING,
                        description: `A concise definition of the word in ${sourceLanguage}.`
                    },
                    exampleSentence: {
                        type: Type.STRING,
                        description: `An example sentence using the word in ${sourceLanguage}.`
                    }
                },
                required: ["translatedWord", "definition", "exampleSentence"]
            }
        }
    });

    const jsonText = response.text.trim();
    const details = JSON.parse(jsonText);
    return details;
  } catch (error) {
    console.error("Error fetching word details from Gemini API:", error);
    throw new Error("Could not fetch details for the word. The AI service may be unavailable, the word is invalid, or your API key is incorrect.");
  }
}