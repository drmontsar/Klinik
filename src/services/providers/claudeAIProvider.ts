/**
 * Claude AI Provider — generates SOAP notes via Anthropic Messages API.
 * Requires CLAUDE_API_KEY in config.
 */

import type { SOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';
import { AI_API_KEY, AI_MODELS } from '../../constants/config';

const SOAP_SYSTEM_PROMPT = `You are a clinical documentation assistant. Given a transcript of a ward round discussion and patient context, generate a structured SOAP note.

Rules:
- Use formal clinical language
- Be concise but thorough
- Include only information mentioned in the transcript
- Flag any safety concerns
- Return ONLY valid JSON with keys: subjective, objective, assessment, plan

Each section should be a string of clinical text.`;

export class ClaudeAIProvider implements AIProvider {
    readonly name = `Claude ${AI_MODELS.claude}`;

    async generateSOAPNote(transcript: string, patientContext: string): Promise<SOAPNote> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: AI_MODELS.claude,
                max_tokens: 2048,
                system: SOAP_SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user',
                        content: `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate a SOAP note as JSON.`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
        if (!textBlock?.text) throw new Error('Claude returned empty response');

        // Extract JSON from response (Claude may wrap in markdown code blocks)
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Could not extract JSON from Claude response');

        return JSON.parse(jsonMatch[0]) as SOAPNote;
    }
}
