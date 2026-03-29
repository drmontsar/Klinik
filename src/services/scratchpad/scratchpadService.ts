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
import { isVisionProviderConfigured } from '../createVisionAIProvider';
import { INITIAL_ASSESSMENT_SYSTEM_PROMPT } from './prompts/initialAssessmentPrompt';
import { FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT } from './prompts/followUpAssessmentPrompt';
import { SOAP_NOTE_SYSTEM_PROMPT } from './prompts/soapNotePrompt';
import { createVisionAIProvider } from '../createVisionAIProvider';
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
// Real implementation — routes through VisionAIProvider abstraction
// ---------------------------------------------------------------------------

/**
 * Builds the user-turn prompt sent alongside the image.
 * SAFETY: allergies are always included so the vision model can flag conflicts.
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

class VisionScratchpadService implements ScratchpadService {
  // ARCHITECTURE: uses VisionAIProvider — never calls a vendor API directly.
  // Swap vision model by changing AI_PROVIDERS.VISION_SCRIBBLE in config.ts.
  private visionProvider = createVisionAIProvider();

  /**
   * Sends the scribble image through the VisionAIProvider and parses the structured note.
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

    let rawText: string;
    try {
      rawText = await this.visionProvider.generateClinicalNoteFromImage(
        base64Image,
        systemPrompt,
        buildPatientContextPrompt(patientContext)
      );
    } catch {
      throw new KliniKScratchpadError(
        'NETWORK_ERROR',
        'No connection right now. Your scribble is saved locally. It will process when you reconnect.',
        true
      );
    }

    // SAFETY: Validate response before returning.
    // A malformed JSON response must never reach the confirmation screen.
    if (!rawText) {
      throw new KliniKScratchpadError(
        'EMPTY_RESPONSE',
        'Note could not be read. Please try again. Your scribble is preserved.',
        true
      );
    }

    // Extract JSON — guard against markdown wrapping
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
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
 * Uses mock when AI_PROVIDERS.VISION_SCRIBBLE is 'mock' or has no API key.
 * Change AI_PROVIDERS.VISION_SCRIBBLE in config.ts to switch implementations.
 */
function createScratchpadService(): ScratchpadService {
  if (!isVisionProviderConfigured()) {
    return new MockScratchpadService();
  }
  return new VisionScratchpadService();
}

/** Singleton scratchpad service instance */
export const scratchpadService: ScratchpadService = createScratchpadService();
