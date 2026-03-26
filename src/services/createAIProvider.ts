/**
 * AI Provider factory — returns the active provider based on config.
 * Change AI_PROVIDER in config.ts to swap AI backends.
 *
 * This is the ONE function you change to switch AI providers.
 */

import type { AIProvider } from './aiProvider';
import { AI_PROVIDER } from '../constants/config';
import { MockAIProvider } from './providers/mockAIProvider';
import { OpenAIProvider } from './providers/openAIProvider';
import { ClaudeAIProvider } from './providers/claudeAIProvider';
import { OllamaAIProvider } from './providers/ollamaAIProvider';

/**
 * Creates and returns the active AI provider.
 * @returns The configured AIProvider implementation
 */
export const createAIProvider = (): AIProvider => {
    switch (AI_PROVIDER) {
        case 'openai':
            return new OpenAIProvider();
        case 'claude':
            return new ClaudeAIProvider();
        case 'ollama':
            return new OllamaAIProvider();
        case 'mock':
        default:
            return new MockAIProvider();
    }
};
