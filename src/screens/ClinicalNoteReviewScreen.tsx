/**
 * ClinicalNoteReviewScreen — Step 3 of the scratchpad flow.
 * Doctor reviews and edits the AI-extracted note before signing.
 *
 * CLINICAL: The "Sign and Save Note" tap is the sacred confirmation step.
 * Nothing is saved to the patient record until this tap.
 * Every field is editable before signing.
 * manualCorrectionsCount is tracked silently — never shown.
 */

import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import type { NoteType } from '../components/scratchpad/NoteTypeSelector';
import type { OPInitialAssessment } from '../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../types/clinical';
import type { ScratchpadNote } from '../hooks/useScratchpad';
import type { Stroke } from '../hooks/useScratchpad';
import InitialAssessmentCard from '../components/scratchpad/InitialAssessmentCard';
import FollowUpAssessmentCard from '../components/scratchpad/FollowUpAssessmentCard';
import SOAPNoteCard from '../components/scratchpad/SOAPNoteCard';
import { createRepository } from '../services/createRepository';
import { getDoctorProfile } from '../services/doctorProfile';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  initial: 'Initial Assessment',
  followup: 'Follow Up',
  soap: 'SOAP Note',
};

const NOTE_TYPE_BADGE_COLOR: Record<NoteType, string> = {
  initial: COLORS.brand,
  followup: COLORS.green,
  soap: '#7C3AED',
};

interface ClinicalNoteReviewScreenProps {
  noteType: NoteType;
  note: ScratchpadNote;
  patient: Patient;
  strokes: Stroke[];
  onConfirmed: () => void;
  onEditScribble: (strokes: Stroke[]) => void;
  onBack: () => void;
}

const ClinicalNoteReviewScreen: React.FC<ClinicalNoteReviewScreenProps> = ({
  noteType,
  note: initialNote,
  patient,
  strokes,
  onConfirmed,
  onEditScribble,
  onBack,
}) => {
  const [note, setNote] = useState<ScratchpadNote>(initialNote);
  // CLINICAL: manualCorrectionsCount tracks AI accuracy — never shown to doctor
  const [manualCorrectionsCount, setManualCorrectionsCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const repository = useMemo(() => createRepository(), []);

  const handleCorrection = () => setManualCorrectionsCount(c => c + 1);

  /**
   * Signs and saves the note to the patient record.
   * CLINICAL: This is the only point at which the note becomes immutable.
   * Before this tap — nothing is saved. After this tap — the record is permanent.
   */
  const handleSign = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const signedAt = new Date().toISOString();
      const doctorName = getDoctorProfile()?.doctorName ?? 'Doctor';

      // Determine note type string and content for the ClinicalNote record
      let noteTypeStr: 'ward-round' | 'progress' | 'admission' = 'ward-round';
      if (noteType === 'initial') noteTypeStr = 'admission';
      else if (noteType === 'followup') noteTypeStr = 'progress';

      // Serialise structured note as content — preserves full structured data
      const content = JSON.stringify({
        ...note,
        _meta: {
          generationMethod: 'scratchpad + claude-vision',
          manualCorrectionsCount,
          signedAt,
          signedBy: doctorName,
        },
      });

      await repository.addNote(patient.id, {
        id: `N-${Date.now()}`,
        author: doctorName,
        content,
        type: noteTypeStr,
        isAIGenerated: true,
        createdAt: signedAt,
        isApproved: true,
      });

      onConfirmed();
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : 'Could not save note. Check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderCard = () => {
    switch (noteType) {
      case 'initial':
        return (
          <InitialAssessmentCard
            note={note as OPInitialAssessment}
            onChange={updated => setNote(updated)}
            onCorrection={handleCorrection}
          />
        );
      case 'followup':
        return (
          <FollowUpAssessmentCard
            note={note as OPFollowUpAssessment}
            onChange={updated => setNote(updated)}
            onCorrection={handleCorrection}
          />
        );
      case 'soap':
        return (
          <SOAPNoteCard
            note={note as StructuredSOAPNote}
            onChange={updated => setNote(updated)}
            onCorrection={handleCorrection}
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
            {patient.name}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
            {patient.age}y · {patient.sex}
          </div>
        </div>
        {/* Visit type badge */}
        <div style={{
          backgroundColor: NOTE_TYPE_BADGE_COLOR[noteType],
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {NOTE_TYPE_LABELS[noteType]}
        </div>
        <div style={{ fontSize: '12px', color: COLORS.textDim, flexShrink: 0 }}>
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* AI draft notice */}
      <div style={{
        backgroundColor: '#EFF6FF',
        borderBottom: `1px solid #BFDBFE`,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#1E40AF',
      }}>
        <span>✦</span>
        <span>AI draft — review every field before signing. Tap any field to edit.</span>
      </div>

      {/* Note content */}
      <div style={{ padding: '16px 16px 0' }}>
        {renderCard()}
      </div>

      {/* Save error */}
      {saveError && (
        <div style={{
          margin: '0 16px 16px',
          backgroundColor: '#FEE2E2',
          border: `1px solid ${COLORS.red}`,
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          color: COLORS.red,
        }}>
          ⚠ {saveError}
        </div>
      )}

      {/* Sticky footer actions */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTop: `1px solid ${COLORS.borderLight}`,
        padding: '12px 16px',
        display: 'flex',
        gap: '10px',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        zIndex: 30,
      }}>
        {/* Edit Scribble — returns to canvas with strokes preserved */}
        <button
          onClick={() => onEditScribble(strokes)}
          disabled={isSaving}
          style={{
            padding: '12px 16px',
            backgroundColor: 'transparent',
            color: COLORS.textSecondary,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          ← Edit Scribble
        </button>

        {/* Sign and Save Note — the sacred confirmation step */}
        <button
          onClick={handleSign}
          disabled={isSaving}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: isSaving ? COLORS.bgMuted : COLORS.green,
            color: isSaving ? COLORS.textDim : '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isSaving ? (
            <>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: COLORS.textMuted, borderRadius: '50%', animation: 'reviewSpin 0.8s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>✓ Sign and Save Note</>
          )}
        </button>
      </div>

      <style>{`@keyframes reviewSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClinicalNoteReviewScreen;
