/**
 * Vision AI Provider factory — returns the active vision provider.
 * Reads AI_PROVIDERS.VISION_SCRIBBLE from config.ts.
 * Change that value to swap vision AI backends.
 *
 * Future options: OpenAIVisionProvider (GPT-4V), GeminiVisionProvider, etc.
 */

import type { VisionAIProvider } from './visionAIProvider';
import { AI_PROVIDERS, AI_API_KEYS } from '../constants/config';
import { ClaudeVisionProvider } from './providers/claudeVisionProvider';

/**
 * Creates and returns the active vision AI provider.
 * Falls back to Claude (the only available vision implementation) if the
 * configured provider is not yet a recognised vision backend.
 * @returns The configured VisionAIProvider implementation
 */
export const createVisionAIProvider = (): VisionAIProvider => {
  const providerType = AI_PROVIDERS.VISION_SCRIBBLE;

  switch (providerType) {
    case 'claude':
      // ClaudeVisionProvider reads AI_API_KEYS.anthropic internally.
      // If the key is absent the scratchpadService factory will have
      // already returned MockScratchpadService before reaching here.
      return new ClaudeVisionProvider();

    // Future:
    // case 'openai':  return new OpenAIVisionProvider();
    // case 'gemini':  return new GeminiVisionProvider();

    default:
      // Any non-vision provider falls back to Claude Vision.
      // Callers should check isProviderConfigured('VISION_SCRIBBLE')
      // before constructing the real service.
      return new ClaudeVisionProvider();
  }
};

/**
 * Returns true if the vision provider has the credentials it needs.
 * Used by ScratchpadService factory to decide real vs mock.
 */
export function isVisionProviderConfigured(): boolean {
  const providerType = AI_PROVIDERS.VISION_SCRIBBLE;
  if (providerType === 'mock') return false;
  if (providerType === 'claude')  return !!AI_API_KEYS.anthropic;
  if (providerType === 'openai')  return !!AI_API_KEYS.openai;
  if (providerType === 'gemini')  return !!AI_API_KEYS.gemini;
  if (providerType === 'ollama')  return true;
  return false;
}
