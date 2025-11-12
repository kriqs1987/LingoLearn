
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Fetches word details directly from the Gemini API.
 */
export async function fetchWordDetails(sourceWord: string, sourceLanguage: string, targetLanguage: string): Promise<{ translatedWord: string; definition: string; exampleSentence: string; }> {
  // Fix: Use process.env.API_KEY as per Gemini API guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Fix: Re-throw a user-friendly error without mentioning API keys, as they are no longer user-configurable.
    throw new Error("Could not fetch details for the word. The AI service may be unavailable or the word is invalid.");
  }
}
