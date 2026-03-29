/**
 * Vision AI Provider interface — the abstraction for image-based AI backends.
 * Not all AI providers support vision; this is a separate contract.
 * Implementations: ClaudeVisionProvider, MockVisionProvider
 *
 * @vendor-independence Replace the implementation to switch vision AI providers.
 * The interface contract never changes.
 */

/**
 * Contract for AI-powered structured note extraction from images.
 */
export interface VisionAIProvider {
  /** Human-readable name of the provider */
  readonly name: string;

  /**
   * Send an image to the vision model and return the raw text response.
   * @param imageBase64 - Base64-encoded PNG (no data URL prefix)
   * @param systemPrompt - The instruction prompt defining the output schema
   * @param userPrompt - Patient context and extraction instructions
   * @returns Raw response text from the model (caller parses JSON)
   * @throws Error if the API call fails
   * @clinical-note Output is always a draft until doctor confirms
   */
  generateClinicalNoteFromImage(
    imageBase64: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<string>;
}
