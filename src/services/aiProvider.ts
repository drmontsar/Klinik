/**
 * AI Provider interface — the core abstraction for swappable AI backends.
 * Implement this interface to add support for any AI service.
 * @clinical-note All generated SOAP notes MUST be reviewed by a clinician before approval.
 */

import type { SOAPNote } from '../types/clinical';

/**
 * Contract for AI-powered SOAP note generation.
 * Implementations: MockAIProvider, OpenAIProvider, ClaudeAIProvider, OllamaAIProvider
 */
export interface AIProvider {
    /** Human-readable name of the provider (e.g., "OpenAI GPT-4o") */
    readonly name: string;

    /**
     * Generate a structured SOAP note from a clinical transcript.
     * @param transcript - The full transcription text from the scribing session
     * @param patientContext - Structured patient context (diagnosis, problems, meds, etc.)
     * @returns A structured SOAP note
     * @throws Error if the API call fails
     */
    generateSOAPNote(transcript: string, patientContext: string): Promise<SOAPNote>;
}
