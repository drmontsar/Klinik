/**
 * DictateScreen — dictation input for all form types (Initial / Follow Up / SOAP).
 *
 * Flow:
 *   1. Doctor taps mic → speaks the clinical note naturally
 *   2. MedASR transcribes in real time
 *   3. On stop → transcript sent to Claude with the correct form-type prompt
 *   4. Claude returns a structured note → onNoteProcessed → ClinicalNoteReviewScreen
 *
 * This screen is separate from ScribingScreen (which is SOAP-only for the
 * existing patient scribing path). DictateScreen is note-type aware.
 */

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';
import type { ScratchpadNote, Stroke } from '../hooks/useScratchpad';
import useAudioCapture from '../hooks/useAudioCapture';
import useMedASRTranscription from '../hooks/useMedASRTranscription';
import ScribingSession from '../components/scribing/ScribingSession';
import { clinicalNoteFromTextService } from '../services/scratchpad/clinicalNoteFromTextService';
import type { ClinicalPatientContext } from '../services/scratchpad/scratchpadService';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  initial: 'Initial Assessment',
  followup: 'Follow Up',
  soap: 'SOAP Note',
};

interface DictateScreenProps {
  /** null for new patients — demographics collected later in ClinicalNoteReviewScreen */
  patient: Patient | null;
  noteType: NoteType;
  onNoteProcessed: (note: ScratchpadNote, strokes: Stroke[]) => void;
  onBack: () => void;
}

const DictateScreen: React.FC<DictateScreenProps> = ({
  patient,
  noteType,
  onNoteProcessed,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingProcessRef = useRef(false);

  const audioCapture = useAudioCapture();
  const transcription = useMedASRTranscription();

  // SAFETY: allergies unknown for new patients — Claude is not asked to flag conflicts.
  const patientContext = useMemo<ClinicalPatientContext>(() => ({
    patientId: patient?.id ?? 'new',
    patientName: patient?.name ?? 'New Patient',
    age: patient?.age ?? 0,
    sex: patient?.sex ?? 'Unknown',
    specialty: 'general-surgery',
    knownDiagnoses: patient ? [patient.diagnosis, ...patient.problems].filter(Boolean) : [],
    knownAllergies: [],
  }), [patient]);

  // Load ASR model on mount
  useEffect(() => {
    transcription.loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once transcription finalises, send to Claude with the correct form-type prompt
  useEffect(() => {
    if (
      pendingProcessRef.current &&
      audioCapture.captureState === 'stopped' &&
      !transcription.isTranscribing &&
      transcription.fullTranscript
    ) {
      pendingProcessRef.current = false;
      setIsProcessing(true);
      clinicalNoteFromTextService
        .processText(transcription.fullTranscript, noteType, patientContext)
        .then(note => {
          onNoteProcessed(note as ScratchpadNote, []);
        })
        .catch(e => {
          setIsProcessing(false);
          setError(
            e instanceof Error
              ? e.message
              : 'Could not process your dictation. Check your connection and try again.'
          );
        });
    }
  }, [
    audioCapture.captureState,
    transcription.isTranscribing,
    transcription.fullTranscript,
    noteType,
    patientContext,
    onNoteProcessed,
  ]);

  const handleStart = useCallback(() => {
    audioCapture.startCapture(chunk => transcription.processAudioChunk(chunk));
  }, [audioCapture, transcription]);

  const handlePause = useCallback(() => audioCapture.pauseCapture(), [audioCapture]);
  const handleResume = useCallback(() => audioCapture.resumeCapture(), [audioCapture]);

  const handleStop = useCallback(() => {
    const fullAudio = audioCapture.stopCapture();
    if (fullAudio) transcription.finalizeTranscription(fullAudio);
    pendingProcessRef.current = true;
  }, [audioCapture, transcription]);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      backgroundColor: COLORS.bgSubtle,
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        padding: '16px 24px',
        borderBottom: `1px solid ${COLORS.borderLight}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: COLORS.textTertiary, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontFamily: 'inherit' }}
        >
          ← Back
        </button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>🎙️ Dictate</div>
          <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{NOTE_TYPE_LABELS[noteType]}</div>
        </div>
      </div>

      {/* Patient context bar */}
      <div style={{
        padding: '10px 24px',
        backgroundColor: COLORS.brandSubtle,
        borderBottom: `1px solid ${COLORS.brandBorder}`,
        fontSize: '14px',
        color: COLORS.textSecondary,
      }}>
        <strong style={{ color: COLORS.text }}>{patient?.name ?? 'New Patient'}</strong>
        {patient && <span style={{ marginLeft: '8px' }}>— {patient.diagnosis}</span>}
      </div>

      <div style={{ padding: '24px' }}>

        {/* Processing overlay — shown while Claude processes the transcript */}
        {isProcessing && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${COLORS.borderLight}`,
              borderTopColor: COLORS.brand,
              borderRadius: '50%',
              animation: 'dictateSpin 0.9s linear infinite',
              margin: '0 auto 20px',
            }} />
            {/* Never say "AI" or "Claude" to the doctor */}
            <div style={{ fontSize: '16px', fontWeight: 500, color: COLORS.text, marginBottom: '8px' }}>
              Reading your dictation...
            </div>
            <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
              Building your {NOTE_TYPE_LABELS[noteType]}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isProcessing && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: `1px solid ${COLORS.red}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: COLORS.red,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <span>⚠ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Recording UI — reuses the same ScribingSession component */}
        {!isProcessing && (
          <ScribingSession
            captureState={audioCapture.captureState}
            isModelLoaded={transcription.isModelLoaded}
            loadingProgress={transcription.loadingProgress}
            pendingAudioSeconds={transcription.pendingAudioSeconds}
            segments={transcription.segments}
            fullTranscript={transcription.fullTranscript}
            isTranscribing={transcription.isTranscribing}
            analyserNode={audioCapture.analyserNode}
            error={audioCapture.error || transcription.error}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        )}
      </div>

      <style>{`@keyframes dictateSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DictateScreen;
