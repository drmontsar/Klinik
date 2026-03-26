/**
 * ASR Provider interface — the core abstraction for swappable speech recognition.
 * Implement this interface to add support for any ASR service or model.
 * @clinical-note Providers should optimize for medical terminology accuracy.
 */

/** Result of a transcription operation */
export interface TranscriptionResult {
    /** The transcribed text */
    text: string;
    /** Timestamped chunks (if supported by the provider) */
    chunks: Array<{ text: string; timestamp: [number, number] }>;
}

/**
 * Contract for speech-to-text providers.
 * Implementations: GoogleMedicalASR, WhisperASR, DeepgramASR, etc.
 */
export interface ASRProvider {
    /** Human-readable name (e.g., "Google Medical Dictation") */
    readonly name: string;

    /**
     * Initialize the provider (load model, validate API key, etc.)
     * @param onProgress - Loading progress callback (0-100)
     * @returns Promise resolving when provider is ready
     */
    init(onProgress?: (progress: number) => void): Promise<void>;

    /**
     * Transcribe audio to text.
     * @param audio - 16kHz mono Float32Array audio data
     * @returns Transcription result with text and optional timestamps
     */
    transcribe(audio: Float32Array): Promise<TranscriptionResult>;

    /** Whether the provider is initialized and ready */
    isReady(): boolean;

    /** Release resources */
    dispose(): void;
}
