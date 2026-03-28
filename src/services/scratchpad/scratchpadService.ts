/**
 * Scratchpad service — extracts structured clinical notes from handwritten
 * scribbles using Claude Vision API.
 *
 * ARCHITECTURE: This is the ONLY file that knows Claude Vision is being used.
 * All other files use the ScratchpadService interface.
 * Switching to a different vision model requires changing only this file.
 *
 * @vendor-independence Replace the implementation class to switch AI providers.
 * The interface contract never changes.
 */

import type { OPInitialAssessment } from '../../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../../types/clinical';
import { AI_API_KEY, AI_MODELS, AI_PROVIDER } from '../../constants/config';
import { INITIAL_ASSESSMENT_SYSTEM_PROMPT } from './prompts/initialAssessmentPrompt';
import { FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT } from './prompts/followUpAssessmentPrompt';
import { SOAP_NOTE_SYSTEM_PROMPT } from './prompts/soapNotePrompt';
import { MockScratchpadService } from './scratchpadService.mock';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Patient context passed to every scratchpad request */
export interface ClinicalPatientContext {
  patientId: string;
  patientName: string;
  age: number;
  sex: string;
  specialty: 'general-medicine' | 'general-surgery' | 'other';
  knownDiagnoses: string[];
  // SAFETY: allergies always passed to Claude.
  // Claude must flag any conflict with prescribed medications in output.
  knownAllergies: string[];
}

/** Standardised error for all scratchpad service failures */
export class KliniKScratchpadError extends Error {
  readonly code: 'EMPTY_RESPONSE' | 'PARSE_ERROR' | 'NETWORK_ERROR' | 'API_ERROR';
  readonly retryable: boolean;

  constructor(
    code: 'EMPTY_RESPONSE' | 'PARSE_ERROR' | 'NETWORK_ERROR' | 'API_ERROR',
    message: string,
    retryable: boolean = true
  ) {
    super(message);
    this.name = 'KliniKScratchpadError';
    this.code = code;
    this.retryable = retryable;
  }
}

/** The scratchpad service interface — the contract that never changes */
export interface ScratchpadService {
  /**
   * Processes a handwritten scribble image and extracts a structured clinical note.
   * @param imageDataUrl - Base64 PNG data URL from canvas.toDataURL()
   * @param noteType - Determines which extraction prompt and schema to use
   * @param patientContext - Patient context for accurate extraction and allergy checking
   * @returns Structured clinical note matching the noteType schema
   * @clinical-note Output is always a draft. Doctor must confirm before saving.
   */
  processScribble(
    imageDataUrl: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote>;
}

// ---------------------------------------------------------------------------
// Real implementation — Claude Vision API
// ---------------------------------------------------------------------------

/**
 * Builds the patient context string injected into every Claude Vision request.
 * SAFETY: allergies are always included so Claude can flag conflicts.
 */
function buildPatientContextPrompt(ctx: ClinicalPatientContext): string {
  return `Patient context:
Name: ${ctx.patientName}
Age: ${ctx.age} years
Sex: ${ctx.sex}
Specialty: ${ctx.specialty}
Known diagnoses: ${ctx.knownDiagnoses.join(', ') || 'None recorded'}
Known allergies: ${ctx.knownAllergies.join(', ') || 'None recorded'}

Extract the complete clinical note from the handwritten scribble in the image above.

SAFETY REQUIREMENT: If any prescribed medication conflicts with or cross-reacts with a known allergy, add this exact warning to patientInstructions: "ALLERGY ALERT: [drug name] — verify before dispensing"

Return ONLY valid JSON matching the specified structure.
No markdown. No backticks. No preamble. No explanation.`;
}

class ClaudeVisionScratchpadService implements ScratchpadService {
  /**
   * Sends the scribble image to Claude Vision and parses the structured note.
   * @clinical-note The doctor always reviews AI output before it is saved.
   */
  async processScribble(
    imageDataUrl: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote> {
    const base64Image = imageDataUrl.replace(/^data:image\/png;base64,/, '');

    const systemPrompt =
      noteType === 'initial'
        ? INITIAL_ASSESSMENT_SYSTEM_PROMPT
        : noteType === 'followup'
        ? FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT
        : SOAP_NOTE_SYSTEM_PROMPT;

    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AI_API_KEY,
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
                    data: base64Image,
                  },
                },
                {
                  type: 'text',
                  text: buildPatientContextPrompt(patientContext),
                },
              ],
            },
          ],
        }),
      });
    } catch {
      throw new KliniKScratchpadError(
        'NETWORK_ERROR',
        'No connection right now. Your scribble is saved locally. It will process when you reconnect.',
        true
      );
    }

    if (!response.ok) {
      throw new KliniKScratchpadError(
        'API_ERROR',
        `Could not read your notes. Check your connection and try again. (Error ${response.status})`,
        response.status !== 401
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');

    // SAFETY: Validate response before returning.
    // A malformed JSON response must never reach the confirmation screen.
    if (!textBlock?.text) {
      throw new KliniKScratchpadError(
        'EMPTY_RESPONSE',
        'Note could not be read. Please try again. Your scribble is preserved.',
        true
      );
    }

    // Extract JSON — guard against markdown wrapping
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new KliniKScratchpadError(
        'PARSE_ERROR',
        'Note structure was incomplete. Try scribbling more clearly or add more clinical detail.',
        true
      );
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new KliniKScratchpadError(
        'PARSE_ERROR',
        'Note structure was incomplete. Try scribbling more clearly or add more clinical detail.',
        true
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Factory — selects implementation based on config
// ---------------------------------------------------------------------------

/**
 * Returns the active scratchpad service implementation.
 * Uses mock when AI_PROVIDER is 'mock' or no API key is configured.
 * Change AI_PROVIDER in config.ts to switch implementations.
 */
function createScratchpadService(): ScratchpadService {
  if (AI_PROVIDER === 'mock' || !AI_API_KEY) {
    return new MockScratchpadService();
  }
  return new ClaudeVisionScratchpadService();
}

/** Singleton scratchpad service instance */
export const scratchpadService: ScratchpadService = createScratchpadService();
