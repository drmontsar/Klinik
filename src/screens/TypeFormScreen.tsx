/**
 * TypeFormScreen — blank structured form for typed note entry.
 *
 * Renders an empty editable form for the selected note type
 * (Initial Assessment / Follow Up / SOAP Note). The doctor fills
 * in fields directly, then taps "Review Note" to proceed to
 * ClinicalNoteReviewScreen before signing.
 *
 * DESIGN: This reuses the same card components as ClinicalNoteReviewScreen
 * so the editing experience is identical. The only difference is that
 * the banner says "Fill in the form" rather than "AI draft — review".
 */

import React, { useState } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';
import type { ScratchpadNote, Stroke } from '../hooks/useScratchpad';
import type { OPInitialAssessment } from '../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../types/clinical';
import InitialAssessmentCard from '../components/scratchpad/InitialAssessmentCard';
import FollowUpAssessmentCard from '../components/scratchpad/FollowUpAssessmentCard';
import SOAPNoteCard from '../components/scratchpad/SOAPNoteCard';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  initial: 'Initial Assessment',
  followup: 'Follow Up',
  soap: 'SOAP Note',
};

interface TypeFormScreenProps {
  /** null for new patients — demographics collected later in ClinicalNoteReviewScreen */
  patient: Patient | null;
  noteType: NoteType;
  onNoteProcessed: (note: ScratchpadNote, strokes: Stroke[]) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Empty form stubs — one per note type
// ---------------------------------------------------------------------------

function makeEmptyInitial(patientId: string): OPInitialAssessment {
  return {
    visitType: 'initial',
    visitDate: new Date().toISOString(),
    patientId,
    doctorId: 'pending-signature',
    specialty: 'general-surgery',
    chiefComplaint: '',
    history: {
      presentingIllness: '',
      relevantPastHistory: '',
      familyHistory: null,
      socialHistory: null,
      allergies: [],
    },
    examination: {
      generalAppearance: '',
      vitals: {
        temperature: null,
        heartRate: null,
        systolicBP: null,
        diastolicBP: null,
        spo2: null,
        respiratoryRate: null,
        weight: null,
        height: null,
      },
      systemicFindings: [],
    },
    diagnosis: { primary: '', secondary: [], icdCode: null },
    prescription: { medications: [] },
    investigations: { ordered: [], urgency: 'routine', instructions: null },
    patientInstructions: [],
    referral: { needed: false, specialty: null, urgency: null, reason: null },
    followUp: { interval: '', condition: null },
    displayNote: { fullText: '' },
  };
}

function makeEmptyFollowUp(patientId: string): OPFollowUpAssessment {
  return {
    visitType: 'followup',
    visitDate: new Date().toISOString(),
    patientId,
    doctorId: 'pending-signature',
    specialty: 'general-surgery',
    intervalHistory: {
      complaint: '',
      progressSinceLastVisit: 'same',
      newComplaints: [],
      medicationCompliance: null,
      sideEffects: [],
    },
    examination: {
      vitals: {
        temperature: null,
        heartRate: null,
        systolicBP: null,
        diastolicBP: null,
        spo2: null,
        respiratoryRate: null,
        weight: null,
      },
      relevantFindings: [],
    },
    investigationResults: { reviewed: [], interpretation: null },
    diagnosis: { primary: '', secondary: [], progressNote: '' },
    prescription: { medications: [] },
    investigations: { ordered: [], urgency: 'routine', instructions: null },
    patientInstructions: [],
    referral: { needed: false, specialty: null, urgency: null, reason: null },
    followUp: { interval: '', condition: null },
    displayNote: { fullText: '' },
  };
}

function makeEmptySOAP(): StructuredSOAPNote {
  return {
    subjective: { chiefComplaint: '', symptoms: [], painScore: null, patientStatement: '' },
    objective: {
      temperature: null,
      heartRate: null,
      systolicBP: null,
      diastolicBP: null,
      spo2: null,
      respiratoryRate: null,
      findings: [],
    },
    assessment: { primaryDiagnosis: '', activeProblemsSummary: '', clinicalReasoning: '' },
    plan: { investigations: [], medications: [], nursing: [], followUp: [], allPlanItems: [] },
    displayNote: { subjective: '', objective: '', assessment: '', plan: '' },
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TypeFormScreen: React.FC<TypeFormScreenProps> = ({
  patient,
  noteType,
  onNoteProcessed,
  onBack,
}) => {
  const patientId = patient?.id ?? 'new';

  const [note, setNote] = useState<ScratchpadNote>(() => {
    if (noteType === 'initial') return makeEmptyInitial(patientId);
    if (noteType === 'followup') return makeEmptyFollowUp(patientId);
    return makeEmptySOAP();
  });

  const renderCard = () => {
    switch (noteType) {
      case 'initial':
        return (
          <InitialAssessmentCard
            note={note as OPInitialAssessment}
            onChange={updated => setNote(updated)}
            onCorrection={() => {}}
          />
        );
      case 'followup':
        return (
          <FollowUpAssessmentCard
            note={note as OPFollowUpAssessment}
            onChange={updated => setNote(updated)}
            onCorrection={() => {}}
          />
        );
      case 'soap':
        return (
          <SOAPNoteCard
            note={note as StructuredSOAPNote}
            onChange={updated => setNote(updated)}
            onCorrection={() => {}}
          />
        );
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      backgroundColor: COLORS.bgSubtle,
      paddingBottom: '100px',
    }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${COLORS.borderLight}`,
        padding: '14px 20px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: COLORS.textTertiary, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
        >
          ← Back
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {patient?.name ?? 'New Patient'}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
            {NOTE_TYPE_LABELS[noteType]}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: COLORS.textDim, flexShrink: 0 }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Instructions banner */}
      <div style={{
        backgroundColor: '#F0FDF4',
        borderBottom: '1px solid #BBF7D0',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#166534',
      }}>
        <span>✏️</span>
        <span>Fill in the fields below. Tap any field to type. Tap Review when done.</span>
      </div>

      {/* Form content */}
      <div style={{ padding: '16px 16px 0' }}>
        {renderCard()}
      </div>

      {/* Sticky footer — Review Note */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTop: `1px solid ${COLORS.borderLight}`,
        padding: '12px 16px',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        zIndex: 30,
      }}>
        <button
          onClick={() => onNoteProcessed(note, [])}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: COLORS.brand,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Review Note →
        </button>
      </div>
    </div>
  );
};

export default TypeFormScreen;
