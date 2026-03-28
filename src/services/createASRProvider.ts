/**
 * ASR Provider factory — returns the active speech recognition implementation.
 * Change ASR_PROVIDER in config.ts to swap speech models.
 *
 * This is the ONE function you change to switch ASR providers.
 */

import type { ASRProvider } from './asrProvider';
import { ASR_PROVIDER } from '../constants/config';
import { GoogleMedicalASR } from './providers/googleMedicalASR';
import { WhisperASR } from './providers/whisperASR';
import { MedAsrASR } from './providers/medAsrASR';

/**
 * Creates and returns the active ASR provider.
 * @returns The configured ASRProvider implementation
 */
export const createASRProvider = (): ASRProvider => {
    switch (ASR_PROVIDER) {
        case 'medasr':
            return new MedAsrASR();
        case 'google_medical':
            return new GoogleMedicalASR();
        case 'whisper':
            return new WhisperASR();
        // Future: case 'deepgram': return new DeepgramASR();
        // Future: case 'aws_medical': return new AWSMedicalASR();
        default:
            return new MedAsrASR();
    }
};
