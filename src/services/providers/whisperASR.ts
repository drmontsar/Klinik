/**
 * Whisper ASR Provider — in-browser transcription via Transformers.js Web Worker.
 * Fully offline — no audio data leaves the device.
 */

import type { ASRProvider, TranscriptionResult } from '../asrProvider';

export class WhisperASR implements ASRProvider {
    readonly name = 'Whisper (Local)';
    private worker: Worker | null = null;
    private ready = false;

    async init(onProgress?: (progress: number) => void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.worker = new Worker(
                new URL('../../workers/whisperWorker.ts', import.meta.url),
                { type: 'module' },
            );

            this.worker.onmessage = (event: MessageEvent) => {
                const { type } = event.data;
                if (type === 'loading' && onProgress) onProgress(event.data.progress);
                if (type === 'ready') { this.ready = true; resolve(); }
                if (type === 'error') reject(new Error(event.data.error));
            };

            this.worker.postMessage({ type: 'load', model: 'onnx-community/whisper-tiny.en' });
        });
    }

    async transcribe(audio: Float32Array): Promise<TranscriptionResult> {
        if (!this.worker || !this.ready) throw new Error('Whisper model not loaded');

        return new Promise<TranscriptionResult>((resolve, reject) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'result') {
                    resolve({ text: event.data.text || '', chunks: event.data.chunks || [] });
                    this.worker?.removeEventListener('message', handler);
                }
                if (event.data.type === 'error') {
                    reject(new Error(event.data.error));
                    this.worker?.removeEventListener('message', handler);
                }
            };
            this.worker!.addEventListener('message', handler);
            this.worker!.postMessage({ type: 'transcribe', audio });
        });
    }

    isReady(): boolean { return this.ready; }

    dispose(): void {
        this.worker?.terminate();
        this.worker = null;
        this.ready = false;
    }
}
