/**
 * MedASR service — thin wrapper over the swappable ASRProvider interface.
 * All consumers use this service; the underlying provider is swapped via config.
 * @clinical-note The active ASR provider is set in constants/config.ts (ASR_PROVIDER).
 */

import { createASRProvider } from './createASRProvider';
import type { ASRProvider, TranscriptionResult } from './asrProvider';

let provider: ASRProvider | null = null;

/**
 * Initialise the active ASR provider.
 * @param onProgress - Loading progress callback (0-100)
 * @param onError - Error callback
 */
export const initMedASR = async (
    onProgress?: (progress: number) => void,
    onError?: (error: string) => void,
): Promise<void> => {
    try {
        provider = createASRProvider();
        await provider.init(onProgress);
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'ASR init failed';
        onError?.(msg);
        throw err;
    }
};

/**
 * Transcribe audio via the active ASR provider.
 * @param audioBuffer - 16kHz mono Float32Array
 * @param onResult - Called with transcription result
 * @param onError - Called on failure
 */
export const transcribeAudio = async (
    audioBuffer: Float32Array,
    onResult: (text: string, chunks: TranscriptionResult['chunks']) => void,
    onError?: (error: string) => void,
): Promise<void> => {
    if (!provider || !provider.isReady()) {
        onError?.('ASR provider not initialized. Call initMedASR() first.');
        return;
    }

    try {
        const result = await provider.transcribe(audioBuffer);
        onResult(result.text, result.chunks);
    } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Transcription failed');
    }
};

/** Check if the ASR provider is ready. */
export const isASRReady = (): boolean => provider?.isReady() ?? false;

/** Get the name of the active ASR provider. */
export const getASRProviderName = (): string => provider?.name ?? 'Not initialized';

/** Terminate the ASR provider and release resources. */
export const terminateASR = (): void => {
    provider?.dispose();
    provider = null;
};
