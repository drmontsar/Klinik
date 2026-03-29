/**
 * Claude Vision Provider — sends images to Anthropic's vision API.
 *
 * THIS IS THE ONLY FILE THAT KNOWS THE ANTHROPIC VISION API FORMAT.
 * All other files use the VisionAIProvider interface.
 * Switching to a different vision model (GPT-4V, Gemini Vision, etc.)
 * requires changing only this file and createVisionAIProvider.ts.
 */

import type { VisionAIProvider } from '../visionAIProvider';
import { AI_API_KEYS, AI_MODELS } from '../../constants/config';

export class ClaudeVisionProvider implements VisionAIProvider {
  readonly name = `Claude Vision ${AI_MODELS.claude}`;

  async generateClinicalNoteFromImage(
    imageBase64: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_API_KEYS.anthropic,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: AI_MODELS.claude,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: userPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Claude Vision API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock?.text) throw new Error('Claude Vision returned empty response');
    return textBlock.text;
  }
}
