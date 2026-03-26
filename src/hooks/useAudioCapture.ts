/**
 * Manages browser microphone audio capture for clinical scribing.
 * Uses WebAudio API to capture 16kHz mono audio and stream Float32Array chunks.
 * @returns Audio capture state, controls, and chunk callback registration
 * @clinical-note Handles microphone permissions and provides clear error states
 */

import { useState, useCallback, useRef } from 'react';
import { AUDIO_CONFIG } from '../constants/config';
import type { CaptureState } from '../types/scribing';

interface UseAudioCaptureResult {
    captureState: CaptureState;
    error: string | null;
    startCapture: (onChunk: (chunk: Float32Array) => void) => Promise<void>;
    stopCapture: () => Float32Array | null;
    pauseCapture: () => void;
    resumeCapture: () => void;
    resetCapture: () => void;
    analyserNode: AnalyserNode | null;
}

const useAudioCapture = (): UseAudioCaptureResult => {
    const [captureState, setCaptureState] = useState<CaptureState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const allChunksRef = useRef<Float32Array[]>([]);
    const onChunkRef = useRef<((chunk: Float32Array) => void) | null>(null);
    const isPausedRef = useRef(false);

    const startCapture = useCallback(async (onChunk: (chunk: Float32Array) => void) => {
        try {
            setError(null);
            onChunkRef.current = onChunk;
            allChunksRef.current = [];
            isPausedRef.current = false;

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
                    channelCount: AUDIO_CONFIG.CHANNELS,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            mediaStreamRef.current = stream;

            // Create AudioContext at target sample rate
            const audioContext = new AudioContext({ sampleRate: AUDIO_CONFIG.SAMPLE_RATE });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);

            // Create an analyser for waveform visualisation
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            setAnalyserNode(analyser);

            // Create ScriptProcessor for audio chunking
            // Buffer size = CHUNK_DURATION_S * SAMPLE_RATE
            const bufferSize = Math.min(16384, AUDIO_CONFIG.CHUNK_DURATION_S * AUDIO_CONFIG.SAMPLE_RATE);
            const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event: AudioProcessingEvent) => {
                if (isPausedRef.current) return;

                const inputData = event.inputBuffer.getChannelData(0);
                const chunk = new Float32Array(inputData);
                allChunksRef.current.push(chunk);
                onChunkRef.current?.(chunk);
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setCaptureState('recording');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Microphone access denied';
            setError(message);
            setCaptureState('error');
        }
    }, []);

    const stopCapture = useCallback((): Float32Array | null => {
        // Stop all media tracks
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        // Disconnect processor
        processorRef.current?.disconnect();
        processorRef.current = null;

        // Close audio context
        audioContextRef.current?.close();
        audioContextRef.current = null;

        setAnalyserNode(null);
        setCaptureState('stopped');

        // Merge all chunks into a single Float32Array
        const chunks = allChunksRef.current;
        if (chunks.length === 0) return null;

        const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }
        allChunksRef.current = [];
        return merged;
    }, []);

    const pauseCapture = useCallback(() => {
        isPausedRef.current = true;
        setCaptureState('paused');
    }, []);

    const resumeCapture = useCallback(() => {
        isPausedRef.current = false;
        setCaptureState('recording');
    }, []);

    const resetCapture = useCallback(() => {
        setCaptureState('idle');
        setError(null);
        setAnalyserNode(null);
        allChunksRef.current = [];
    }, []);

    return { captureState, error, startCapture, stopCapture, pauseCapture, resumeCapture, resetCapture, analyserNode };
};

export default useAudioCapture;
