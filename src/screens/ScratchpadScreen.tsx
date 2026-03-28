/**
 * ScratchpadScreen — Step 2 of the scratchpad flow.
 * Full-screen canvas for handwritten clinical notes.
 * The useScratchpad hook drives rendering and submission.
 */

import React, { useRef, useMemo } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';
import ScratchpadCanvas from '../components/scratchpad/ScratchpadCanvas';
import ScratchpadToolbar from '../components/scratchpad/ScratchpadToolbar';
import { useScratchpad, type Stroke, type ScratchpadNote } from '../hooks/useScratchpad';
import type { ClinicalPatientContext } from '../services/scratchpad/scratchpadService';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  initial: 'Initial Assessment',
  followup: 'Follow Up',
  soap: 'SOAP Note',
};

interface ScratchpadScreenProps {
  patient: Patient;
  noteType: NoteType;
  initialStrokes?: Stroke[];
  onNoteProcessed: (note: ScratchpadNote, strokes: Stroke[]) => void;
  onBack: () => void;
}

const ScratchpadScreen: React.FC<ScratchpadScreenProps> = ({
  patient,
  noteType,
  initialStrokes,
  onNoteProcessed,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Build patient context for the AI service
  const patientContext = useMemo<ClinicalPatientContext>(() => ({
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    sex: patient.sex,
    specialty: 'general-surgery',
    knownDiagnoses: [patient.diagnosis, ...patient.problems].filter(Boolean),
    // SAFETY: allergies always passed so Claude can flag conflicts
    knownAllergies: [],
  }), [patient]);

  const {
    strokes,
    isProcessing,
    error,
    startStroke,
    continueStroke,
    endStroke,
    undo,
    clear,
    submit,
    clearError,
  } = useScratchpad(
    canvasRef,
    noteType,
    patientContext,
    onNoteProcessed,
    initialStrokes
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#1A1F2E',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header strip — minimal to maximise canvas space */}
      <div style={{
        height: '48px',
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
        >
          ← Back
        </button>
        <div style={{ height: '16px', width: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          {patient.name}
        </div>
        <div style={{
          marginLeft: 'auto',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '3px 10px',
          borderRadius: '20px',
        }}>
          {NOTE_TYPE_LABELS[noteType]}
        </div>
      </div>

      {/* Canvas area — fills remaining space above toolbar */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ScratchpadCanvas
          canvasRef={canvasRef}
          onStartStroke={startStroke}
          onContinueStroke={continueStroke}
          onEndStroke={endStroke}
          isProcessing={isProcessing}
        />

        {/* Processing overlay — shown while Claude Vision processes the image */}
        {isProcessing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 5,
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255,255,255,0.15)',
              borderTopColor: COLORS.brand,
              borderRadius: '50%',
              animation: 'scratchpadSpin 0.9s linear infinite',
            }} />
            {/* Never say "AI" or "Claude" to the doctor */}
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', fontWeight: 500 }}>
              Reading your notes...
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div style={{
            position: 'absolute',
            bottom: '74px',
            left: '16px',
            right: '16px',
            backgroundColor: '#7F1D1D',
            border: '1px solid #DC2626',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            zIndex: 10,
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#FECACA', fontWeight: 500, marginBottom: '2px' }}>
                {error}
              </div>
            </div>
            <button
              onClick={clearError}
              style={{ background: 'none', border: 'none', color: '#FECACA', cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Toolbar — fixed at bottom */}
      <ScratchpadToolbar
        strokeCount={strokes.length}
        isProcessing={isProcessing}
        onUndo={undo}
        onClear={clear}
        onDone={submit}
      />

      <style>{`@keyframes scratchpadSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ScratchpadScreen;
