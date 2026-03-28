/**
 * MedASR Provider — Google Health AI medical speech recognition.
 *
 * Calls a locally-hosted FastAPI server (medasr-server/server.py)
 * that runs the google/medasr model on-device.
 *
 * CLINICAL: Audio never leaves the hospital network.
 * HIPAA-ready — no external API calls during transcription.
 *
 * Setup: see medasr-server/README.md
 */

import type { ASRProvider, TranscriptionResult } from '../asrProvider';
import { MEDASR_SERVER_URL } from '../../constants/config';

export class MedAsrASR implements ASRProvider {
    readonly name = 'MedASR (Google Health AI — Local)';
    private ready = false;

    /**
     * Ping the local server health endpoint to confirm it is running.
     * @param onProgress - Loading progress callback (0–100)
     * @clinical-note Server must be running before init() is called.
     * Start with: cd medasr-server && uvicorn server:app --port 8008
     */
    async init(onProgress?: (progress: number) => void): Promise<void> {
        onProgress?.(10);

        try {
            const res = await fetch(`${MEDASR_SERVER_URL}/health`, {
                signal: AbortSignal.timeout(5000), // 5s timeout
            });

            if (!res.ok) {
                throw new Error(`Health check returned ${res.status}`);
            }

            const data = await res.json() as { status: string };

            if (data.status === 'loading') {
                // Model still warming up — wait and retry once
                onProgress?.(50);
                await delay(3000);
                await this.init(onProgress);
                return;
            }

            this.ready = true;
            onProgress?.(100);
            console.info(`[ASR] ${this.name} connected at ${MEDASR_SERVER_URL}`);

        } catch (err) {
            throw new Error(
                'MedASR server not running. ' +
                'Start it with:\n\n' +
                '  cd medasr-server\n' +
                '  source venv/bin/activate\n' +
                '  uvicorn server:app --port 8008\n\n' +
                'See medasr-server/README.md for full setup instructions.',
            );
        }
    }

    /**
     * Transcribe clinical audio via the local MedASR server.
     * @param audio - 16kHz mono Float32Array from useAudioCapture
     * @returns Transcription result with text
     * @clinical-note MedASR is trained on medical speech — drug names,
     * diagnoses, and clinical abbreviations are transcribed accurately.
     */
    async transcribe(audio: Float32Array): Promise<TranscriptionResult> {
        if (!this.ready) {
            throw new Error('MedASR provider not initialised. Call init() first.');
        }

        // Convert Float32Array → WAV Blob for multipart upload
        const wavBlob = float32ToWav(audio, 16000);
        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');

        let response: Response;
        try {
            response = await fetch(`${MEDASR_SERVER_URL}/transcribe`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30_000), // 30s — long recordings
            });
        } catch (err) {
            // SAFETY: Server went down mid-session — actionable error
            throw new Error(
                'MedASR server unreachable. Your recording is preserved. ' +
                'Restart the server or type the consultation manually.',
            );
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({})) as { detail?: string };
            throw new Error(
                body.detail ??
                `Transcription failed (HTTP ${response.status}). ` +
                'Your recording is preserved — retry or type below.',
            );
        }

        const result = await response.json() as { text: string };
        return { text: result.text ?? '', chunks: [] };
    }

    isReady(): boolean { return this.ready; }

    dispose(): void { this.ready = false; }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple delay utility */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert a Float32Array (16kHz mono PCM) to a WAV Blob.
 * MedASR server accepts standard WAV files via multipart upload.
 */
function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = samples.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);          // PCM chunk size
    view.setUint16(20, 1, true);           // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // PCM samples: float32 → int16
    const output = new Int16Array(buffer, 44, samples.length);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
