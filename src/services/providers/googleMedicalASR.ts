/**
 * Google Cloud Speech-to-Text ASR Provider — medical_dictation model.
 * Optimized for clinical terminology: diagnoses, medications, symptoms.
 * Requires GOOGLE_SPEECH_API_KEY in config.
 */

import type { ASRProvider, TranscriptionResult } from '../asrProvider';
import { GOOGLE_SPEECH_API_KEY, GOOGLE_SPEECH_MODEL, AUDIO_CONFIG } from '../../constants/config';

export class GoogleMedicalASR implements ASRProvider {
    readonly name = `Google ${GOOGLE_SPEECH_MODEL}`;
    private ready = false;

    async init(onProgress?: (progress: number) => void): Promise<void> {
        onProgress?.(50);
        if (!GOOGLE_SPEECH_API_KEY) {
            console.warn('[GoogleMedicalASR] No API key set. Set GOOGLE_SPEECH_API_KEY in config.ts');
        }
        this.ready = true;
        onProgress?.(100);
    }

    async transcribe(audio: Float32Array): Promise<TranscriptionResult> {
        if (!GOOGLE_SPEECH_API_KEY) {
            throw new Error('Google Speech API key not configured. Set GOOGLE_SPEECH_API_KEY in constants/config.ts');
        }

        const audioContent = float32ToBase64Linear16(audio);

        const response = await fetch(
            `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        encoding: 'LINEAR16',
                        sampleRateHertz: AUDIO_CONFIG.SAMPLE_RATE,
                        languageCode: 'en-US',
                        model: GOOGLE_SPEECH_MODEL,
                        enableAutomaticPunctuation: true,
                        enableSpokenPunctuation: { value: true },
                        useEnhanced: true,
                    },
                    audio: { content: audioContent },
                }),
            },
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `Google Speech API error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results || [];
        const text = results
            .map((r: { alternatives?: Array<{ transcript: string }> }) =>
                r.alternatives?.[0]?.transcript || ''
            )
            .join(' ')
            .trim();

        return { text, chunks: [] };
    }

    isReady(): boolean { return this.ready; }
    dispose(): void { this.ready = false; }
}

/** Convert Float32Array audio to base64-encoded LINEAR16 PCM */
function float32ToBase64Linear16(float32: Float32Array): string {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
