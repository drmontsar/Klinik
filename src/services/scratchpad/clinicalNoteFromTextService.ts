/**
 * Clinical note from text service — extracts structured clinical notes from
 * dictated or typed text using the Claude API.
 *
 * ARCHITECTURE: Shares the same output JSON schemas as the scratchpad
 * (image) service. Only the input modality differs — text instead of image.
 * Switching AI providers requires changing only this file.
 *
 * @vendor-independence Replace the implementation class to switch AI providers.
 */

import type { OPInitialAssessment } from '../../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../../types/clinical';
import { isProviderConfigured } from '../createAIProvider';
import { INITIAL_ASSESSMENT_SYSTEM_PROMPT } from './prompts/initialAssessmentPrompt';
import { FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT } from './prompts/followUpAssessmentPrompt';
import { SOAP_NOTE_SYSTEM_PROMPT } from './prompts/soapNotePrompt';
import { createAIProvider } from '../createAIProvider';
import type { ClinicalPatientContext } from './scratchpadService';
import { KliniKScratchpadError } from './scratchpadService';
import { MockScratchpadService } from './scratchpadService.mock';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ClinicalNoteFromTextService {
  /**
   * Processes dictated or typed text and extracts a structured clinical note.
   * @param text - The transcription or typed text from the doctor
   * @param noteType - Determines which extraction prompt and schema to use
   * @param patientContext - Patient context for accurate extraction
   * @returns Structured clinical note matching the noteType schema
   * @clinical-note Output is always a draft. Doctor must confirm before saving.
   */
  processText(
    text: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds the user message sent to Claude with patient context + dictation text.
 * SAFETY: allergies always included so Claude can flag conflicts.
 */
function buildTextPrompt(text: string, ctx: ClinicalPatientContext): string {
  return `Patient context:
Name: ${ctx.patientName}
Age: ${ctx.age} years
Sex: ${ctx.sex}
Specialty: ${ctx.specialty}
Known diagnoses: ${ctx.knownDiagnoses.join(', ') || 'None recorded'}
Known allergies: ${ctx.knownAllergies.join(', ') || 'None recorded'}

Dictated consultation transcript:
${text}

Extract the complete clinical note from the transcript above.

SAFETY REQUIREMENT: If any prescribed medication conflicts with or cross-reacts with a known allergy, add this exact warning to patientInstructions: "ALLERGY ALERT: [drug name] — verify before dispensing"

Return ONLY valid JSON matching the specified structure.
No markdown. No backticks. No preamble. No explanation.`;
}

// ---------------------------------------------------------------------------
// Real implementation — routes through AIProvider abstraction
// ---------------------------------------------------------------------------

class TextNoteService implements ClinicalNoteFromTextService {
  // ARCHITECTURE: uses AIProvider — never calls a vendor API directly.
  // Swap AI model by changing AI_PROVIDERS.TEXT_TO_NOTE in config.ts.
  private aiProvider = createAIProvider('TEXT_TO_NOTE');

  /**
   * Sends the dictated or typed transcript through the AIProvider and parses the structured note.
   * @clinical-note The doctor always reviews AI output before it is saved.
   */
  async processText(
    text: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote> {
    const systemPrompt =
      noteType === 'initial'
        ? INITIAL_ASSESSMENT_SYSTEM_PROMPT
        : noteType === 'followup'
        ? FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT
        : SOAP_NOTE_SYSTEM_PROMPT;

    let rawText: string;
    try {
      rawText = await this.aiProvider.generateClinicalNote(
        systemPrompt,
        buildTextPrompt(text, patientContext)
      );
    } catch {
      throw new KliniKScratchpadError(
        'NETWORK_ERROR',
        'No connection right now. Your dictation is saved. Check your connection and try again.',
        true
      );
    }

    // SAFETY: Validate response before returning.
    if (!rawText) {
      throw new KliniKScratchpadError(
        'EMPTY_RESPONSE',
        'Note could not be extracted. Please try again.',
        true
      );
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new KliniKScratchpadError(
        'PARSE_ERROR',
        'Note structure was incomplete. Try dictating more clearly with full clinical detail.',
        true
      );
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new KliniKScratchpadError(
        'PARSE_ERROR',
        'Note structure was incomplete. Try dictating more clearly with full clinical detail.',
        true
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Mock implementation — reuses mock scratchpad data
// ---------------------------------------------------------------------------

class MockTextNoteService implements ClinicalNoteFromTextService {
  private mock = new MockScratchpadService();
  async processText(
    _text: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote> {
    // MOCK: ignores text, returns same realistic demo data as scribble mock
    return this.mock.processScribble('', noteType, patientContext);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function createClinicalNoteFromTextService(): ClinicalNoteFromTextService {
  if (!isProviderConfigured('TEXT_TO_NOTE')) {
    return new MockTextNoteService();
  }
  return new TextNoteService();
}

/** Singleton text-to-note service instance */
export const clinicalNoteFromTextService: ClinicalNoteFromTextService =
  createClinicalNoteFromTextService();
