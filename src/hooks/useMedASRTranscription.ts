/**
 * Manages MedASR in-browser transcription via the Whisper Web Worker.
 * Accumulates audio chunks and sends them to Whisper at intervals for best results.
 * @returns Transcription state, segments, full transcript, and control methods
 * @clinical-note Uses Whisper model for clinical terminology accuracy
 */

import { useState, useCallback, useRef } from 'react';
import { initMedASR, transcribeAudio, isASRReady } from '../services/medAsrService';
import { AUDIO_CONFIG } from '../constants/config';
import type { TranscriptionSegment } from '../types/scribing';

interface UseMedASRResult {
    isModelLoaded: boolean;
    isTranscribing: boolean;
    loadingProgress: number;
    pendingAudioSeconds: number;
    segments: TranscriptionSegment[];
    fullTranscript: string;
    error: string | null;
    loadModel: () => Promise<void>;
    processAudioChunk: (chunk: Float32Array) => void;
    finalizeTranscription: (fullAudio: Float32Array) => void;
    reset: () => void;
}

/** Minimum audio duration in seconds before sending to Whisper */
const MIN_CHUNK_SECONDS = 3;
const MIN_SAMPLES = MIN_CHUNK_SECONDS * AUDIO_CONFIG.SAMPLE_RATE;

const useMedASRTranscription = (): UseMedASRResult => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
    const [fullTranscript, setFullTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pendingAudioSeconds, setPendingAudioSeconds] = useState(0);

    const segmentCountRef = useRef(0);
    const accumulatedChunksRef = useRef<Float32Array[]>([]);
    const accumulatedSamplesRef = useRef(0);
    const isBusyRef = useRef(false);

    const loadModel = useCallback(async () => {
        try {
            setError(null);
            setLoadingProgress(0);

            await initMedASR(
                (progress) => setLoadingProgress(progress),
                (err) => setError(err),
            );

            setIsModelLoaded(true);
            setLoadingProgress(100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load ASR model');
        }
    }, []);

    /** Merge accumulated chunks into a single Float32Array */
    const mergeChunks = useCallback(() => {
        const chunks = accumulatedChunksRef.current;
        if (chunks.length === 0) return null;

        const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }
        return merged;
    }, []);

    /** Send accumulated audio to Whisper */
    const flushToWhisper = useCallback(() => {
        if (!isASRReady() || isBusyRef.current) return;

        const audio = mergeChunks();
        if (!audio || audio.length < AUDIO_CONFIG.SAMPLE_RATE) return; // need at least 1s

        // Clear buffer
        accumulatedChunksRef.current = [];
        accumulatedSamplesRef.current = 0;
        isBusyRef.current = true;
        setIsTranscribing(true);

        transcribeAudio(
            audio,
            (text, _chunks) => {
                isBusyRef.current = false;
                if (!text.trim()) {
                    setIsTranscribing(false);
                    return;
                }

                segmentCountRef.current += 1;
                const newSegment: TranscriptionSegment = {
                    id: `seg-${segmentCountRef.current}`,
                    text: text.trim(),
                    confidence: 0.9,
                    startTime: 0,
                    endTime: 0,
                    isFinal: false,
                };

                setSegments(prev => [...prev, newSegment]);
                setFullTranscript(prev => (prev ? `${prev} ${text.trim()}` : text.trim()));
                setIsTranscribing(false);
            },
            (err) => {
                isBusyRef.current = false;
                setError(err);
                setIsTranscribing(false);
            },
        );
    }, [mergeChunks]);

    const processAudioChunk = useCallback((chunk: Float32Array) => {
        // Accumulate chunks
        accumulatedChunksRef.current.push(chunk);
        accumulatedSamplesRef.current += chunk.length;
        setPendingAudioSeconds(accumulatedSamplesRef.current / AUDIO_CONFIG.SAMPLE_RATE);

        // Once we have enough audio, flush to Whisper
        if (accumulatedSamplesRef.current >= MIN_SAMPLES && !isBusyRef.current) {
            flushToWhisper();
        }
    }, [flushToWhisper]);

    const finalizeTranscription = useCallback((fullAudio: Float32Array) => {
        if (!isASRReady()) return;

        // Clear any remaining accumulated chunks
        accumulatedChunksRef.current = [];
        accumulatedSamplesRef.current = 0;
        isBusyRef.current = true;
        setIsTranscribing(true);

        // Do a final pass on the complete audio for best accuracy
        transcribeAudio(
            fullAudio,
            (text, chunks) => {
                isBusyRef.current = false;
                if (!text.trim()) {
                    setIsTranscribing(false);
                    return;
                }

                // Replace streaming segments with final accurate transcription
                const finalSegments: TranscriptionSegment[] = chunks.length > 0
                    ? chunks.map((chunk, idx) => ({
                        id: `final-${idx}`,
                        text: chunk.text.trim(),
                        confidence: 0.95,
                        startTime: chunk.timestamp[0],
                        endTime: chunk.timestamp[1],
                        isFinal: true,
                    }))
                    : [{
                        id: 'final-0',
                        text: text.trim(),
                        confidence: 0.95,
                        startTime: 0,
                        endTime: 0,
                        isFinal: true,
                    }];

                setSegments(finalSegments);
                setFullTranscript(text.trim());
                setIsTranscribing(false);
            },
            (err) => {
                isBusyRef.current = false;
                setError(err);
                setIsTranscribing(false);
            },
        );
    }, []);

    /** Clear transcript state without terminating the ASR provider (for re-record) */
    const reset = useCallback(() => {
        setSegments([]);
        setFullTranscript('');
        setError(null);
        setIsTranscribing(false);
        setPendingAudioSeconds(0);
        segmentCountRef.current = 0;
        accumulatedChunksRef.current = [];
        accumulatedSamplesRef.current = 0;
        isBusyRef.current = false;
        // NOTE: Don't terminate ASR — keep the model loaded for re-recording
    }, []);

    return {
        isModelLoaded,
        isTranscribing,
        loadingProgress,
        pendingAudioSeconds,
        segments,
        fullTranscript,
        error,
        loadModel,
        processAudioChunk,
        finalizeTranscription,
        reset,
    };
};

export default useMedASRTranscription;
