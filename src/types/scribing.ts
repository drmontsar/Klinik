/**
 * Scribing-related TypeScript interfaces
 * Covers audio capture, transcription, and SOAP generation sessions
 */

/** Audio capture state */
export type CaptureState = 'idle' | 'recording' | 'paused' | 'stopped' | 'error';

/** A single transcription segment from MedASR */
export interface TranscriptionSegment {
    /** Unique segment ID */
    id: string;
    /** Transcribed text */
    text: string;
    /** Confidence score 0–1 */
    confidence: number;
    /** Start timestamp (seconds from session start) */
    startTime: number;
    /** End timestamp (seconds from session start) */
    endTime: number;
    /** Whether this is a final or interim result */
    isFinal: boolean;
}

/** Full scribing session state */
export interface ScribingSession {
    /** Unique session ID */
    id: string;
    /** Patient this session is for */
    patientId: string;
    /** Current capture state */
    captureState: CaptureState;
    /** All transcription segments so far */
    segments: TranscriptionSegment[];
    /** Full concatenated transcript */
    fullTranscript: string;
    /** Generated SOAP note (null until generated) */
    soapNote: import('./clinical').SOAPNote | null;
    /** Session start time */
    startedAt: string;
    /** Session end time (null if still active) */
    endedAt: string | null;
    /** Total recording duration in seconds */
    durationSeconds: number;
}

/** Waveform data point for audio visualisation */
export interface WaveformDataPoint {
    /** Amplitude value 0–1 */
    amplitude: number;
    /** Timestamp in seconds */
    timestamp: number;
}
