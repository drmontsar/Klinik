/**
 * Ollama Provider — generates SOAP notes via a local Ollama instance.
 * Fully offline — no data leaves the machine.
 * Requires Ollama running locally (default: http://localhost:11434).
 */

import type { SOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';
import { AI_MODELS, OLLAMA_BASE_URL } from '../../constants/config';

const SOAP_SYSTEM_PROMPT = `You are a clinical documentation assistant. Given a transcript of a ward round discussion and patient context, generate a structured SOAP note.

Rules:
- Use formal clinical language
- Be concise but thorough
- Include only information mentioned in the transcript
- Flag any safety concerns
- Return ONLY valid JSON with keys: subjective, objective, assessment, plan

Each section should be a string of clinical text.`;

export class OllamaAIProvider implements AIProvider {
    readonly name = `Ollama ${AI_MODELS.ollama} (Local)`;

    async generateClinicalNote(systemPrompt: string, userPrompt: string): Promise<string> {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: AI_MODELS.ollama,
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false,
                format: 'json',
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status} — is Ollama running at ${OLLAMA_BASE_URL}?`);
        }

        const data = await response.json();
        if (!data.response) throw new Error('Ollama returned empty response');
        return data.response;
    }

    async generateSOAPNote(transcript: string, patientContext: string): Promise<SOAPNote> {
        const raw = await this.generateClinicalNote(
            SOAP_SYSTEM_PROMPT,
            `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate a SOAP note as JSON.`
        );
        return JSON.parse(raw) as SOAPNote;
    }
}
