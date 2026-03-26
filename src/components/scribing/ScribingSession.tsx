import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import type { TranscriptionSegment, CaptureState } from '../../types/scribing';
import WaveformDisplay from './WaveformDisplay';

/**
 * The main scribing session UI — recording controls, waveform, timer, live transcript.
 * @param captureState - Current audio capture state
 * @param isModelLoaded - Whether the Whisper model is loaded
 * @param loadingProgress - Model loading progress (0-100)
 * @param segments - Transcription segments
 * @param fullTranscript - Full transcript text
 * @param isTranscribing - Whether transcription is in progress
 * @param analyserNode - AnalyserNode for waveform display
 * @param error - Any error message
 * @param onStart - Start recording callback
 * @param onPause - Pause recording callback
 * @param onResume - Resume recording callback
 * @param onStop - Stop recording and generate SOAP callback
 * @clinical-note Session data is auto-saved to prevent loss of clinical documentation
 */
interface ScribingSessionProps {
    captureState: CaptureState;
    isModelLoaded: boolean;
    loadingProgress: number;
    pendingAudioSeconds: number;
    segments: TranscriptionSegment[];
    fullTranscript: string;
    isTranscribing: boolean;
    analyserNode: AnalyserNode | null;
    error: string | null;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
}

const ScribingSession: React.FC<ScribingSessionProps> = ({
    captureState,
    isModelLoaded,
    loadingProgress,
    pendingAudioSeconds,
    segments,
    fullTranscript,
    isTranscribing,
    analyserNode,
    error,
    onStart,
    onPause,
    onResume,
    onStop,
}) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Timer
    useEffect(() => {
        if (captureState === 'recording') {
            timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [captureState]);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [segments]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Model Loading */}
            {!isModelLoaded && (
                <div style={{ padding: '20px', backgroundColor: COLORS.bgSubtle, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text, marginBottom: '12px' }}>
                        🧠 Loading Whisper ASR Model...
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: COLORS.borderLight, borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${loadingProgress}%`, height: '100%', backgroundColor: COLORS.brand, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '13px', color: COLORS.textMuted, marginTop: '8px' }}>
                        {loadingProgress < 100 ? `${Math.round(loadingProgress)}% — downloading model...` : 'Ready!'}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: COLORS.redBg, borderRadius: '8px', border: `1px solid ${COLORS.redBorder}`, color: COLORS.red, fontSize: '14px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Waveform */}
            {(captureState === 'recording' || captureState === 'paused') && (
                <WaveformDisplay analyserNode={analyserNode} />
            )}

            {/* Processing Status */}
            {(captureState === 'recording' || captureState === 'paused') && (
                <div style={{ textAlign: 'center', padding: '8px', fontSize: '14px', color: COLORS.textSecondary }}>
                    {isTranscribing ? (
                        <span style={{ color: COLORS.brand, fontWeight: 600 }}>
                            ⏳ Processing with Whisper... (this takes a few seconds)
                        </span>
                    ) : pendingAudioSeconds > 0 ? (
                        <span>
                            🎤 Capturing audio: {pendingAudioSeconds.toFixed(1)}s
                            {pendingAudioSeconds < 3 && <span style={{ color: COLORS.textMuted }}> — need 3s to transcribe</span>}
                        </span>
                    ) : (
                        <span style={{ color: COLORS.textMuted }}>🎤 Speak clearly into your mic...</span>
                    )}
                </div>
            )}

            {/* Timer & Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'monospace', color: captureState === 'recording' ? COLORS.red : COLORS.text }}>
                    {captureState === 'recording' && <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS.red, marginRight: '12px', animation: 'pulse 1s infinite' }} />}
                    {formatTime(elapsedSeconds)}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {captureState === 'idle' && (
                    <button onClick={onStart} disabled={!isModelLoaded} style={{
                        backgroundColor: isModelLoaded ? COLORS.brand : COLORS.textMuted,
                        color: COLORS.surface, border: 'none', borderRadius: '24px',
                        padding: '14px 32px', fontSize: '16px', fontWeight: 600,
                        cursor: isModelLoaded ? 'pointer' : 'not-allowed', display: 'flex',
                        alignItems: 'center', gap: '8px',
                    }}>
                        <span style={{ fontSize: '20px' }}>🎙️</span> Start Recording
                    </button>
                )}

                {captureState === 'recording' && (
                    <>
                        <button onClick={onPause} style={{
                            backgroundColor: COLORS.amber, color: COLORS.surface,
                            border: 'none', borderRadius: '24px', padding: '12px 24px',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        }}>⏸ Pause</button>
                        <button onClick={onStop} style={{
                            backgroundColor: COLORS.red, color: COLORS.surface,
                            border: 'none', borderRadius: '24px', padding: '12px 24px',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        }}>⏹ Stop & Generate SOAP</button>
                    </>
                )}

                {captureState === 'paused' && (
                    <>
                        <button onClick={onResume} style={{
                            backgroundColor: COLORS.brand, color: COLORS.surface,
                            border: 'none', borderRadius: '24px', padding: '12px 24px',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        }}>▶ Resume</button>
                        <button onClick={onStop} style={{
                            backgroundColor: COLORS.red, color: COLORS.surface,
                            border: 'none', borderRadius: '24px', padding: '12px 24px',
                            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                        }}>⏹ Stop & Generate SOAP</button>
                    </>
                )}
            </div>

            {/* Live Transcript */}
            {segments.length > 0 && (
                <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: COLORS.text }}>📝 Live Transcript</h3>
                        {isTranscribing && (
                            <span style={{ fontSize: '12px', color: COLORS.brand, fontWeight: 600 }}>
                                ● Transcribing...
                            </span>
                        )}
                    </div>
                    <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '14px', lineHeight: '1.6', color: COLORS.textSecondary }}>
                        {fullTranscript || segments.map(s => s.text).join(' ')}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>
            )}

            {/* CSS Keyframes for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default ScribingSession;
