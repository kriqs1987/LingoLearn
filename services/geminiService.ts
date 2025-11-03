import { GoogleGenAI, Type } from "@google/genai";

// FIX: Per coding guidelines, the API key must be obtained exclusively from
// process.env.API_KEY and used directly. The previous check has been removed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchWordDetails(word: string, targetLanguage: string): Promise<{ translation: string; definition: string; exampleSentence: string; }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `For the English word "${word}", provide a simple definition for an A1-level English learner, its ${targetLanguage} translation, and one example sentence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: {
              type: Type.STRING,
              description: `The ${targetLanguage} translation of the word.`
            },
            definition: {
              type: Type.STRING,
              description: "A simple, A1-level definition of the word in English."
            },
            exampleSentence: {
              type: Type.STRING,
              description: "An example sentence using the word."
            }
          },
          required: ["translation", "definition", "exampleSentence"]
        },
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse;

  } catch (error) {
    console.error("Error fetching word details from Gemini API:", error);
    throw new Error("Could not fetch details for the word. The AI may be unavailable or the word is invalid.");
  }
}
