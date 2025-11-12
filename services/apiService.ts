import { User, Dictionary, Word } from '../types';

const API_BASE_URL = 'https://v442.mikr.dev/lingolearn/api.php';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'An unknown API error occurred.');
  }
  return data.data;
}

export const apiService = {
  // === AUTH ===
  async login(username: string, password_DO_NOT_USE_IN_PROD: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: password_DO_NOT_USE_IN_PROD }),
    });
    return handleResponse(response);
  },

  async register(username: string, password_DO_NOT_USE_IN_PROD: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: password_DO_NOT_USE_IN_PROD }),
    });
    return handleResponse(response);
  },

  // === DICTIONARIES ===
  async getDictionaries(token: string): Promise<Dictionary[]> {
    const response = await fetch(`${API_BASE_URL}?action=getDictionaries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  async createDictionary(token: string, data: { name: string; sourceLanguage: string; targetLanguage: string }): Promise<Dictionary> {
    const response = await fetch(`${API_BASE_URL}?action=createDictionary`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async deleteDictionary(token: string, dictionaryId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?action=deleteDictionary`, {
        method: 'POST', // Using POST for simplicity as forms might be used; DELETE is more RESTful
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dictionaryId })
    });
    await handleResponse(response);
  },

  // === WORDS ===
  async addWord(token: string, dictionaryId: string, wordDetails: Omit<Word, 'id' | 'masteryLevel' | 'lastReviewed'>): Promise<Word> {
      const response = await fetch(`${API_BASE_URL}?action=addWord`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ dictionaryId, ...wordDetails })
      });
      return handleResponse(response);
  },

  async deleteWord(token: string, wordId: string): Promise<void> {
      const response = await fetch(`${API_BASE_URL}?action=deleteWord`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId })
      });
      await handleResponse(response);
  },

  async updateWord(token: string, wordId: string, details: { translatedWord: string; exampleSentence: string; }): Promise<Word> {
    const response = await fetch(`${API_BASE_URL}?action=updateWord`, {
          method: 'POST', // Using POST, PUT is more RESTful
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, ...details })
      });
      return handleResponse(response);
  },

  async updateWordMastery(token: string, wordId: string, isCorrect: boolean): Promise<Word> {
      const response = await fetch(`${API_BASE_URL}?action=updateWordMastery`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: wordId, isCorrect })
      });
      return handleResponse(response);
  },

  // === GEMINI PROXY ===
  async getWordDetails(sourceWord: string, sourceLanguage: string, targetLanguage: string): Promise<{ translatedWord: string; definition: string; exampleSentence: string; }> {
      const response = await fetch(`${API_BASE_URL}?action=getWordDetails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceWord, sourceLanguage, targetLanguage })
      });
      return handleResponse(response);
  },

  // === ADMIN ===
  async getAdminUserStats(token: string): Promise<any[]> {
      const response = await fetch(`${API_BASE_URL}?action=getAdminStats`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      return handleResponse(response);
  }
};
