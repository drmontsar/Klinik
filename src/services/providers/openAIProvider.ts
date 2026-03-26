/**
 * OpenAI Provider — generates SOAP notes via GPT-4o API.
 * Requires OPENAI_API_KEY in config.
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

export class OpenAIProvider implements AIProvider {
    readonly name = `OpenAI ${AI_MODELS.openai}`;

    async generateSOAPNote(transcript: string, patientContext: string): Promise<SOAPNote> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
                model: AI_MODELS.openai,
                messages: [
                    { role: 'system', content: SOAP_SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate a SOAP note as JSON.`,
                    },
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');

        return JSON.parse(content) as SOAPNote;
    }
}
