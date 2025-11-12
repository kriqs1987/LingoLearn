import { apiService } from './apiService';

/**
 * Fetches word details by calling our own backend, which in turn calls the Gemini API.
 * This prevents exposing the Gemini API key on the client side.
 */
export async function fetchWordDetails(sourceWord: string, sourceLanguage: string, targetLanguage: string): Promise<{ translatedWord: string; definition: string; exampleSentence: string; }> {
  try {
    const details = await apiService.getWordDetails(sourceWord, sourceLanguage, targetLanguage);
    return details;
  } catch (error) {
    console.error("Error fetching word details from backend:", error);
    // Re-throw a user-friendly error
    throw new Error("Could not fetch details for the word. The AI service may be unavailable or the word is invalid.");
  }
}
