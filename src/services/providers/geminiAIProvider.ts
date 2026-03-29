/**
 * Gemini AI Provider — generates clinical notes via Google Gemini API.
 *
 * THIS IS THE ONLY FILE THAT KNOWS THE GOOGLE GEMINI API FORMAT.
 * All other files use the AIProvider interface.
 * Switching away from Gemini requires changing only this file and
 * AI_PROVIDERS in config.ts.
 */

import type { StructuredSOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';
import { AI_API_KEYS, AI_MODELS } from '../../constants/config';
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
- Plan: separate arrays for investigations, medications, nursing tasks, and follow up items.
  One specific action per array item.
  No sub-bullets. No vague items.

Indian clinical context:
- Preserve Indian drug names and brand names exactly
- Indian English accent transcription may have minor errors — use clinical context to interpret correctly
- Specialty is ${specialty}

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
}

export class GeminiAIProvider implements AIProvider {
  readonly name = `Gemini ${AI_MODELS.gemini}`;

  async generateClinicalNote(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.gemini}:generateContent?key=${AI_API_KEYS.gemini}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          // Ask Gemini to return JSON directly where possible.
          // Falls back to free text — caller always extracts via regex.
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ` +
        `Transcription saved — tap Retry or switch to typed note entry.`
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }

  async generateSOAPNote(
    transcript: string,
    patientContext: string
  ): Promise<StructuredSOAPNote> {
    const raw = await this.generateClinicalNote(
      buildSOAPSystemPrompt(),
      `Patient Context:\n${patientContext}\n\nTranscript:\n${transcript}\n\nGenerate the structured SOAP note as JSON.`
    );

    // Extract JSON — guard against markdown wrapping
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON from Gemini response');
    return JSON.parse(jsonMatch[0]) as StructuredSOAPNote;
  }
}
