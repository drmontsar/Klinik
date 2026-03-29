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

/** Available AI providers */
export type AIProviderType = 'mock' | 'openai' | 'claude' | 'ollama' | 'gemini';

/**
 * Per-purpose AI provider configuration.
 * Each clinical input modality can use a different AI backend simultaneously.
 * Changing a single value here swaps that modality's AI without touching any other.
 *
 * Example: use Gemini for typed notes while keeping Claude for vision scribble:
 *   TEXT_TO_NOTE: 'gemini'
 *   VISION_SCRIBBLE: 'claude'
 */
export const AI_PROVIDERS = {
  /** Voice scribing: transcript → SOAP note */
  SOAP_SCRIBING: 'claude' as AIProviderType,
  /** Text / dictation: typed or dictated text → structured note */
  TEXT_TO_NOTE: 'claude' as AIProviderType,
  /** Handwriting: scribble image → structured note (provider must support vision) */
  VISION_SCRIBBLE: 'claude' as AIProviderType,
} as const;

export type AIPurpose = keyof typeof AI_PROVIDERS;

/**
 * API keys per vendor.
 * Leave a key empty to fall back to mock for any purpose using that vendor.
 */
export const AI_API_KEYS = {
  /** Anthropic — https://console.anthropic.com */
  anthropic: '',
  /** OpenAI — https://platform.openai.com */
  openai: '',
  /** Google AI Studio — https://aistudio.google.com */
  gemini: '',
} as const;

/** AI model identifiers per provider */
export const AI_MODELS = {
    openai: 'gpt-4o',
    claude: 'claude-sonnet-4-20250514',
    ollama: 'llama3',
    gemini: 'gemini-2.0-flash',
} as const;

/** Ollama server URL (for local AI) */
export const OLLAMA_BASE_URL = 'http://localhost:11434';

// ---------------------------------------------------------------------------
// ASR Provider Configuration
// ---------------------------------------------------------------------------

/** Available ASR providers for speech-to-text */
export type ASRProviderType = 'google_medical' | 'whisper' | 'medasr';

/** Active ASR provider — change this to swap speech recognition backends */
export const ASR_PROVIDER: ASRProviderType = 'medasr';

// ---------------------------------------------------------------------------
// MedASR Local Server (used when ASR_PROVIDER = 'medasr')
// ---------------------------------------------------------------------------

/**
 * URL of the locally-hosted MedASR FastAPI server.
 * Start the server with: cd medasr-server && uvicorn server:app --port 8008
 * For pilot hospital LAN deployment, replace with the server's LAN IP.
 * Example: 'http://192.168.1.100:8008'
 */
export const MEDASR_SERVER_URL = 'http://localhost:8008';

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
