/**
 * Claude AI Provider — generates StructuredSOAPNote via Anthropic Messages API.
 * THE ONLY FILE IN THE CODEBASE THAT IMPORTS FROM @anthropic-ai/sdk or calls
 * api.anthropic.com directly. All other files use the AIProvider interface.
 */

import type { StructuredSOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';
import { AI_API_KEY, AI_MODELS } from '../../constants/config';

// CLINICAL: This system prompt is specified in CLAUDE.md and must not be paraphrased.
// It governs the clinical accuracy of every AI-generated note in the system.
const SOAP_SYSTEM_PROMPT = `You are a clinical documentation assistant in an Indian surgical oncology ward. Generate a structured clinical note from the consultation transcript provided.

Rules:
- Subjective: patient symptoms in natural language, what the patient reports, pain score if mentioned
- Objective: vital signs extracted as numbers, physical examination findings
- Assessment: clinical interpretation and reasoning, primary diagnosis, active problem summary
- Plan: separate arrays for investigations, medications, nursing tasks, and follow up items.
  One specific action per array item.
  No sub-bullets. No vague items.

Indian clinical context:
- Preserve Indian drug names and brand names exactly
- Indian English accent transcription may have minor errors — use clinical context to interpret correctly
- Specialty is surgical oncology

Return ONLY valid JSON matching this exact structure.
No other text. No markdown. No backticks:

{
  "subjective": {
    "chiefComplaint": "string",
    "symptoms": ["string"],
    "painScore": number or null,
    "patientStatement": "string"
  },
  "objective": {
    "temperature": number or null,
    "heartRate": number or null,
    "systolicBP": number or null,
    "diastolicBP": number or null,
    "spo2": number or null,
    "respiratoryRate": number or null,
    "findings": ["string"]
  },
  "assessment": {
    "primaryDiagnosis": "string",
    "activeProblemsSummary": "string",
    "clinicalReasoning": "string"
  },
  "plan": {
    "investigations": ["string"],
    "medications": ["string"],
    "nursing": ["string"],
    "followUp": ["string"],
    "allPlanItems": ["string"]
  },
  "displayNote": {
    "subjective": "string",
    "objective": "string",
    "assessment": "string",
    "plan": "string"
  }
}`;

export class ClaudeAIProvider implements AIProvider {
  readonly name = `Claude ${AI_MODELS.claude}`;

  async generateSOAPNote(
    transcript: string,
    patientContext: string
  ): Promise<StructuredSOAPNote> {
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
            content: `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate the structured SOAP note as JSON.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Claude API error: ${response.status} ${response.statusText}. ` +
        `Transcription saved — tap Retry or switch to typed note entry.`
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock?.text) throw new Error('Claude returned empty response');

    // Extract JSON — Claude should return raw JSON per prompt, but guard against markdown wrapping
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON from Claude response');

    return JSON.parse(jsonMatch[0]) as StructuredSOAPNote;
  }
}
