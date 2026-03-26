/**
 * Whisper ASR Web Worker — runs Transformers.js Whisper model off the main thread.
 * Communicates via postMessage:
 *   Main → Worker: { type: 'load' } | { type: 'transcribe', audio: Float32Array }
 *   Worker → Main: { type: 'loading', progress } | { type: 'ready' } | { type: 'result', text, chunks } | { type: 'error', error }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let transcriber: any = null;

self.onmessage = async (event: MessageEvent) => {
    const { type } = event.data;

    if (type === 'load') {
        try {
            self.postMessage({ type: 'loading', progress: 0 });

            // Dynamic import to avoid complex type inference issues
            const { pipeline } = await import('@huggingface/transformers');

            transcriber = await pipeline(
                'automatic-speech-recognition',
                event.data.model || 'onnx-community/whisper-tiny.en',
                {
                    dtype: 'q8' as const,
                    device: 'wasm' as const,
                    progress_callback: (progress: { progress?: number; status?: string }) => {
                        if (progress.progress !== undefined) {
                            self.postMessage({ type: 'loading', progress: progress.progress });
                        }
                    },
                },
            );

            self.postMessage({ type: 'ready' });
        } catch (error) {
            self.postMessage({ type: 'error', error: `Failed to load Whisper model: ${error}` });
        }
    }

    if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ type: 'error', error: 'Model not loaded. Send { type: "load" } first.' });
            return;
        }

        try {
            const audio: Float32Array = event.data.audio;

            const result = await transcriber(audio, {
                return_timestamps: true,
            });

            // result can be a single object or array
            const output = Array.isArray(result) ? result[0] : result;

            self.postMessage({
                type: 'result',
                text: output.text || '',
                chunks: output.chunks || [],
            });
        } catch (error) {
            self.postMessage({ type: 'error', error: `Transcription failed: ${error}` });
        }
    }
};
