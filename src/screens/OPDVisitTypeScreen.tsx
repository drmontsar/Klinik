/**
 * OPDVisitTypeScreen — Step 1 of the scratchpad flow.
 * Doctor selects note type (Initial Assessment, Follow Up, or SOAP Note)
 * before the canvas opens. Patient name is shown to confirm correct patient.
 */

import React, { useState } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import NoteTypeSelector from '../components/scratchpad/NoteTypeSelector';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';

interface OPDVisitTypeScreenProps {
  patient: Patient;
  onSelect: (type: NoteType, patient: Patient) => void;
  onBack: () => void;
}

const OPDVisitTypeScreen: React.FC<OPDVisitTypeScreenProps> = ({ patient, onSelect, onBack }) => {
  const [selectedType, setSelectedType] = useState<NoteType | null>(null);

  const handleStart = () => {
    if (!selectedType) return;
    onSelect(selectedType, patient);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      backgroundColor: COLORS.bgSubtle,
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
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
          style={{ background: 'none', border: 'none', color: COLORS.textTertiary, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontFamily: 'inherit' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>New Note</div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Patient confirmation — doctor verifies correct patient before scribbling */}
        <div style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: COLORS.brandSubtle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}>
            🧑‍⚕️
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: COLORS.text }}>{patient.name}</div>
            <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
              {patient.age}y · {patient.sex} · {patient.hospitalNumber ?? patient.location}
            </div>
          </div>
        </div>

        {/* Note type selection */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: COLORS.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Note Type
          </div>
          <NoteTypeSelector selectedType={selectedType} onSelect={setSelectedType} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTop: `1px solid ${COLORS.borderLight}`,
        padding: '16px 24px',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        zIndex: 20,
      }}>
        <button
          onClick={handleStart}
          disabled={!selectedType}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: selectedType ? COLORS.brand : COLORS.bgMuted,
            color: selectedType ? COLORS.surface : COLORS.textDim,
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: selectedType ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background-color 0.15s',
          }}
        >
          ✏️ Start Scribbling →
        </button>
      </div>

      {/* Padding for fixed footer */}
      <div style={{ height: '80px' }} />
    </div>
  );
};

export default OPDVisitTypeScreen;
