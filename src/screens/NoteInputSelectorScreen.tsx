/**
 * NoteInputSelectorScreen — unified 3-tap entry point for all note-taking modes.
 *
 * Flow:
 *   Tap 1 — "New Patient" from ward list lands here
 *   Tap 2 — select note type (Initial Assessment / Follow Up / SOAP Note)
 *   Tap 3 — tap input method card → immediately enters that mode
 *
 * For new patients (no patient prop): compact name / age / sex fields appear.
 * For existing patients: patient confirmation chip is shown instead.
 *
 * DESIGN: input method cards are always visible but only active once a note
 * type is chosen. This keeps the layout stable and reduces visual surprise.
 */

import React, { useState } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import NoteTypeSelector from '../components/scratchpad/NoteTypeSelector';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputMethod = 'scribble' | 'dictate' | 'type';

/** Minimal demographics collected on this screen for brand-new patients. */
export interface NewPatientInfo {
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
}

interface NoteInputSelectorScreenProps {
  /** Existing patient — undefined when registering a brand-new patient. */
  patient?: Patient;
  onBack: () => void;
  /**
   * Called when the doctor taps an input method card.
   * @param method   - Which mode was chosen
   * @param noteType - Which form type was chosen
   * @param newPatient - Demographics filled in for a new patient (absent for existing patients)
   */
  onSelect: (method: InputMethod, noteType: NoteType, newPatient?: NewPatientInfo) => void;
}

// ---------------------------------------------------------------------------
// Input method options
// ---------------------------------------------------------------------------

interface InputMethodOption {
  key: InputMethod;
  icon: string;
  label: string;
  description: string;
}

const INPUT_METHODS: InputMethodOption[] = [
  {
    key: 'scribble',
    icon: '✏️',
    label: 'Scribble',
    description: 'Draw on screen',
  },
  {
    key: 'dictate',
    icon: '🎙️',
    label: 'Dictate',
    description: 'Speak to AI',
  },
  {
    key: 'type',
    icon: '📝',
    label: 'Type',
    description: 'Structured form',
  },
];

// ---------------------------------------------------------------------------
// Shared style constants
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: COLORS.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '10px',
  display: 'block',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NoteInputSelectorScreen: React.FC<NoteInputSelectorScreenProps> = ({
  patient,
  onBack,
  onSelect,
}) => {
  const isNewPatient = !patient;

  const [noteType, setNoteType] = useState<NoteType | null>(null);
  // New-patient demographics — ignored when patient prop is provided
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [methodError, setMethodError] = useState(false);

  const handleMethodTap = (method: InputMethod) => {
    if (!noteType) {
      // Flash the note-type section to prompt selection
      setMethodError(true);
      setTimeout(() => setMethodError(false), 1200);
      return;
    }

    if (isNewPatient) {
      onSelect(method, noteType, {
        name: patientName.trim(),
        age: parseInt(patientAge, 10) || 0,
        sex: patientSex,
      });
    } else {
      onSelect(method, noteType);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      backgroundColor: COLORS.bgSubtle,
      paddingBottom: '32px',
    }}>
      {/* ── Header ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${COLORS.borderLight}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: COLORS.textTertiary,
            fontSize: '16px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '4px', fontWeight: 500, fontFamily: 'inherit',
          }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
          {isNewPatient ? 'New Patient' : 'New Note'}
        </div>
      </div>

      <div style={{ padding: '24px' }}>

        {/* ── Existing patient chip ── */}
        {!isNewPatient && (
          <div style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: COLORS.brandSubtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              🧑‍⚕️
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: COLORS.text }}>
                {patient!.name}
              </div>
              <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                {patient!.age}y · {patient!.sex} · {patient!.location}
              </div>
            </div>
          </div>
        )}

        {/* ── New-patient demographics ── */}
        {isNewPatient && (
          <div style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <span style={labelStyle}>Patient Details</span>
            {/* Name */}
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Patient name"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: COLORS.text,
                  backgroundColor: COLORS.bgSubtle,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            {/* Age + Sex row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                placeholder="Age"
                value={patientAge}
                onChange={e => setPatientAge(e.target.value)}
                min={0}
                max={120}
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: COLORS.text,
                  backgroundColor: COLORS.bgSubtle,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <select
                value={patientSex}
                onChange={e => setPatientSex(e.target.value as 'Male' | 'Female' | 'Other')}
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: COLORS.text,
                  backgroundColor: COLORS.bgSubtle,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Scribble hint — name not required when drawing */}
            <div style={{ fontSize: '12px', color: COLORS.textDim, marginTop: '8px' }}>
              Name optional for Scribble — write it on the canvas and it will be read automatically.
            </div>
          </div>
        )}

        {/* ── Note type selector ── */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            ...labelStyle,
            color: methodError ? COLORS.red : COLORS.textMuted,
            transition: 'color 0.3s',
          }}>
            {methodError ? '← Select a note type first' : 'Select note type'}
          </span>
          <NoteTypeSelector selectedType={noteType} onSelect={setNoteType} />
        </div>

        {/* ── Input method cards ── */}
        <div>
          <span style={labelStyle}>How do you want to enter?</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            {INPUT_METHODS.map(method => {
              const active = !!noteType;
              return (
                <button
                  key={method.key}
                  onClick={() => handleMethodTap(method.key)}
                  style={{
                    padding: '20px 8px',
                    backgroundColor: active ? COLORS.surface : COLORS.bgMuted,
                    border: `2px solid ${active ? COLORS.borderLight : 'transparent'}`,
                    borderRadius: '14px',
                    cursor: active ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.15s, border-color 0.15s, transform 0.1s',
                    opacity: active ? 1 : 0.45,
                  }}
                  onMouseEnter={e => {
                    if (active) e.currentTarget.style.borderColor = COLORS.brand;
                  }}
                  onMouseLeave={e => {
                    if (active) e.currentTarget.style.borderColor = COLORS.borderLight;
                  }}
                  onMouseDown={e => {
                    if (active) e.currentTarget.style.transform = 'scale(0.96)';
                  }}
                  onMouseUp={e => {
                    if (active) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{method.icon}</span>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: active ? COLORS.text : COLORS.textDim,
                  }}>
                    {method.label}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: active ? COLORS.textMuted : COLORS.textDim,
                    textAlign: 'center',
                  }}>
                    {method.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoteInputSelectorScreen;
