/**
 * Application configuration constants
 * Controls environment behavior, API endpoints, and model selection
 */

// CLINICAL: When MOCK_MODE is true, all data is synthetic.
// Set to false only when connected to a validated clinical backend.

/** Toggle between mock data and live API calls */
export const MOCK_MODE = false;

/** Base URL for all API endpoints */
export const API_BASE_URL = '/api';

// ---------------------------------------------------------------------------
// AI Provider Configuration
// ---------------------------------------------------------------------------

/** Available AI providers for SOAP note generation */
export type AIProviderType = 'mock' | 'openai' | 'claude' | 'ollama';

/** Active AI provider — change this to swap AI backends */
export const AI_PROVIDER: AIProviderType = 'mock';

/** API key for the active AI provider (set via environment or hardcode for dev) */
export const AI_API_KEY = '';

/** AI model identifiers per provider */
export const AI_MODELS = {
    openai: 'gpt-4o',
    claude: 'claude-sonnet-4-20250514',
    ollama: 'llama3',
} as const;

/** Ollama server URL (for local AI) */
export const OLLAMA_BASE_URL = 'http://localhost:11434';

// ---------------------------------------------------------------------------
// ASR Provider Configuration
// ---------------------------------------------------------------------------

/** Available ASR providers for speech-to-text */
export type ASRProviderType = 'google_medical' | 'whisper';

/** Active ASR provider — change this to swap speech recognition backends */
export const ASR_PROVIDER: ASRProviderType = 'whisper';

// ---------------------------------------------------------------------------
// Google Cloud Speech-to-Text Settings (used when ASR_PROVIDER = 'google_medical')
// ---------------------------------------------------------------------------

/** Google Cloud API key for Speech-to-Text */
export const GOOGLE_SPEECH_API_KEY = '';

/**
 * Google Speech-to-Text model:
 *   'medical_dictation'    — single clinician dictating notes (best for ward rounds)
 *   'medical_conversation' — multi-party clinical conversations
 *   'latest_long'          — general purpose (fallback)
 */
export const GOOGLE_SPEECH_MODEL = 'medical_dictation';

/** Audio configuration for microphone capture */
export const AUDIO_CONFIG = {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    /** Chunk duration in seconds before sending for transcription */
    CHUNK_DURATION_S: 5,
} as const;

/** Session timeout (milliseconds) — auto-save after inactivity */
export const SESSION_TIMEOUT_MS = 300_000; // 5 minutes
