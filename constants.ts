
export const MAX_MASTERY_LEVEL = 5;
export const QUIZ_SESSION_LENGTH = 5;

// Unified key for all application data stored in localStorage
export const LOCAL_STORAGE_DATA_KEY = 'lingoLearnData';
// Fix: API key is now handled by environment variables, so this is no longer needed.
// export const LOCAL_STORAGE_API_KEY = 'lingoLearnApiKey';
// Fix: Add missing constant for storing user data to resolve import errors.
export const LOCAL_STORAGE_USERS_KEY = 'lingoLearnUsers';


export const SUPPORTED_LANGUAGES = [
    "Norwegian",
    "English",
    "Romanian",
    "Polish"
];
