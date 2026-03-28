/**
 * OpenAI Provider — generates StructuredSOAPNote via GPT-4o API.
 * Requires OPENAI_API_KEY in config. Fallback when Claude is unavailable.
 */

import type { StructuredSOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';
import { AI_API_KEY, AI_MODELS } from '../../constants/config';
import { getDoctorProfile } from '../doctorProfile';

// CLINICAL: System prompt structure mirrors CLAUDE.md specification exactly.
// Specialty is injected at runtime from the doctor's profile.
function buildSOAPSystemPrompt(): string {
  const specialty = getDoctorProfile()?.specialty ?? 'general medicine';
  return `You are a clinical documentation assistant in an Indian ${specialty} ward. Generate a structured clinical note from the consultation transcript provided.

Rules:
- Subjective: patient symptoms in natural language, what the patient reports, pain score if mentioned
- Objective: vital signs extracted as numbers, physical examination findings
- Assessment: clinical interpretation and reasoning, primary diagnosis, active problem summary
- Plan: separate arrays for investigations, medications, nursing tasks, and follow up items. One specific action per array item.

Indian clinical context:
- Preserve Indian drug names and brand names exactly
- Indian English accent transcription may have minor errors — use clinical context to interpret correctly
- Specialty is ${specialty}

Return ONLY valid JSON matching this exact structure. No other text. No markdown. No backticks:

{
  "subjective": { "chiefComplaint": "string", "symptoms": ["string"], "painScore": number or null, "patientStatement": "string" },
  "objective": { "temperature": number or null, "heartRate": number or null, "systolicBP": number or null, "diastolicBP": number or null, "spo2": number or null, "respiratoryRate": number or null, "findings": ["string"] },
  "assessment": { "primaryDiagnosis": "string", "activeProblemsSummary": "string", "clinicalReasoning": "string" },
  "plan": { "investigations": ["string"], "medications": ["string"], "nursing": ["string"], "followUp": ["string"], "allPlanItems": ["string"] },
  "displayNote": { "subjective": "string", "objective": "string", "assessment": "string", "plan": "string" }
}`;

export class OpenAIProvider implements AIProvider {
  readonly name = `OpenAI ${AI_MODELS.openai}`;

  async generateSOAPNote(
    transcript: string,
    patientContext: string
  ): Promise<StructuredSOAPNote> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODELS.openai,
        messages: [
          { role: 'system', content: buildSOAPSystemPrompt() },
          {
            role: 'user',
            content: `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate the structured SOAP note as JSON.`,
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

    return JSON.parse(content) as StructuredSOAPNote;
  }
}
