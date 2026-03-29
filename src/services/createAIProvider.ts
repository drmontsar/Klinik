/**
 * AI Provider factory — returns the active provider for a given clinical purpose.
 *
 * Each purpose (SOAP_SCRIBING, TEXT_TO_NOTE, VISION_SCRIBBLE) can be wired to a
 * different AI backend simultaneously. Change AI_PROVIDERS in config.ts to swap.
 *
 * This is the ONE place that knows which class backs which purpose.
 */

import type { AIProvider } from './aiProvider';
import { AI_PROVIDERS, AI_API_KEYS, type AIPurpose } from '../constants/config';
import { MockAIProvider } from './providers/mockAIProvider';
import { OpenAIProvider } from './providers/openAIProvider';
import { ClaudeAIProvider } from './providers/claudeAIProvider';
import { OllamaAIProvider } from './providers/ollamaAIProvider';
import { GeminiAIProvider } from './providers/geminiAIProvider';

/**
 * Returns true if the given provider type has the credentials it needs to run.
 * Ollama is self-hosted so never needs a key.
 */
function isConfigured(providerType: string): boolean {
  switch (providerType) {
    case 'claude':  return !!AI_API_KEYS.anthropic;
    case 'openai':  return !!AI_API_KEYS.openai;
    case 'gemini':  return !!AI_API_KEYS.gemini;
    case 'ollama':  return true; // self-hosted, no key needed
    case 'mock':    return true;
    default:        return false;
  }
}

/**
 * Creates and returns the AI provider for the given clinical purpose.
 * Falls back to MockAIProvider when the configured provider has no credentials.
 * @param purpose - Which clinical task this provider will serve
 * @returns The configured AIProvider implementation
 */
export const createAIProvider = (purpose: AIPurpose = 'SOAP_SCRIBING'): AIProvider => {
  const providerType = AI_PROVIDERS[purpose];

  if (providerType === 'mock' || !isConfigured(providerType)) {
    return new MockAIProvider();
  }

  switch (providerType) {
    case 'claude':  return new ClaudeAIProvider();
    case 'openai':  return new OpenAIProvider();
    case 'gemini':  return new GeminiAIProvider();
    case 'ollama':  return new OllamaAIProvider();
    default:        return new MockAIProvider();
  }
};

/**
 * Returns true if the configured provider for a purpose has valid credentials.
 * Used by service factories to decide whether to use the real or mock service.
 * @param purpose - The clinical purpose to check
 */
export function isProviderConfigured(purpose: AIPurpose): boolean {
  const providerType = AI_PROVIDERS[purpose];
  return providerType !== 'mock' && isConfigured(providerType);
}
