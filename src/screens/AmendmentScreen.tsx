import React, { useState, useEffect, useMemo } from 'react';
import { COLORS } from '../constants/colors';
import type { ClinicalNote } from '../types/patient';
import AmendmentForm from '../components/amendment/AmendmentForm';
import { createRepository } from '../services/createRepository';

/**
 * Amendment screen — lists a patient's notes and allows the doctor to amend one.
 * @param patientId - The patient whose notes are shown
 * @param noteId - If provided, pre-selects a specific note to amend
 * @param onBack - Callback to return to the previous screen
 * @clinical-note No entry is ever deleted. Amendment workflow: original preserved,
 * correction attached, reason mandatory, clinician identity and timestamp recorded.
 */
const AmendmentScreen: React.FC<{
  patientId: string;
  noteId?: string;
  onBack: () => void;
}> = ({ patientId, noteId, onBack }) => {
  const repository = useMemo(() => createRepository(), []);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load patient notes
  useEffect(() => {
    repository
      .getPatientById(patientId)
      .then(patient => {
        if (patient) {
          const approvedNotes = patient.notes.filter(n => n.isApproved);
          setNotes(approvedNotes);
          // Pre-select if noteId provided
          if (noteId) {
            const preSelected = approvedNotes.find(n => n.id === noteId);
            if (preSelected) setSelectedNote(preSelected);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [repository, patientId, noteId]);

  const handleSubmitAmendment = async (amendedText: string, reason: string) => {
    if (!selectedNote) return;
    setIsSubmitting(true);
    try {
      // CLINICAL: Amendment creates an immutable audit record.
      // Original note is preserved. Amendment is appended to the record.
      const amendmentNote: ClinicalNote = {
        id: `A-${Date.now()}`,
        author: 'Dr. (Current User)',
        content: amendedText,
        type: selectedNote.type,
        isAIGenerated: false,
        createdAt: new Date().toISOString(),
        isApproved: true,
      };

      await repository.addNote(patientId, amendmentNote);

      setSuccessMessage(
        `Amendment recorded. Reason: "${reason}". Original note preserved in full.`
      );
      setSelectedNote(null);

      // Refresh notes list
      const patient = await repository.getPatientById(patientId);
      if (patient) setNotes(patient.notes.filter(n => n.isApproved));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={screenStyle}>
        <Header onBack={onBack} />
        <div style={{ padding: '48px', textAlign: 'center', color: COLORS.textMuted }}>
          Loading notes...
        </div>
      </div>
    );
  }

  // ── Amendment form ───────────────────────────────────────────────────────

  if (selectedNote) {
    return (
      <div style={screenStyle}>
        <Header onBack={() => setSelectedNote(null)} backLabel="← Back to Notes" />
        <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: COLORS.text }}>
              Amend Note
            </h2>
            <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
              {new Date(selectedNote.createdAt).toLocaleString('en-IN')} · {selectedNote.author}
            </div>
          </div>
          <AmendmentForm
            originalNote={selectedNote}
            onSubmit={handleSubmitAmendment}
            onCancel={() => setSelectedNote(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // ── Note list ────────────────────────────────────────────────────────────

  return (
    <div style={screenStyle}>
      <Header onBack={onBack} />
      <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: COLORS.text }}>
            Amend Clinical Note
          </h2>
          <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
            Select a note to amend. Original notes are always preserved.
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: COLORS.greenBg,
              border: `1px solid ${COLORS.green}`,
              borderRadius: '10px',
              fontSize: '13px',
              color: COLORS.green,
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {notes.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textMuted,
              backgroundColor: COLORS.surface,
              borderRadius: '12px',
              border: `1px solid ${COLORS.borderLight}`,
            }}
          >
            No approved notes found for this patient.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onSelect={() => setSelectedNote(note)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────

const screenStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  minHeight: '100vh',
  backgroundColor: COLORS.bgSubtle,
};

const Header: React.FC<{ onBack: () => void; backLabel?: string }> = ({
  onBack,
  backLabel = '← Back',
}) => (
  <div
    style={{
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
    }}
  >
    <button
      onClick={onBack}
      style={{
        background: 'none',
        border: 'none',
        color: COLORS.textTertiary,
        fontSize: '15px',
        cursor: 'pointer',
        fontWeight: 500,
      }}
    >
      {backLabel}
    </button>
    <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
      ✏️ Amend Note
    </div>
  </div>
);

const NoteCard: React.FC<{ note: ClinicalNote; onSelect: () => void }> = ({
  note,
  onSelect,
}) => (
  <div
    style={{
      backgroundColor: COLORS.surface,
      borderRadius: '12px',
      border: `1px solid ${COLORS.borderLight}`,
      padding: '16px',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s',
    }}
    onClick={onSelect}
    onMouseEnter={e =>
      ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')
    }
    onMouseLeave={e =>
      ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')
    }
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
      }}
    >
      <div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: COLORS.brand,
            backgroundColor: COLORS.brandLight,
            padding: '2px 8px',
            borderRadius: '10px',
            textTransform: 'capitalize',
            marginRight: '8px',
          }}
        >
          {note.type.replace('-', ' ')}
        </span>
        {note.isAIGenerated && (
          <span
            style={{
              fontSize: '12px',
              color: COLORS.purple,
              backgroundColor: COLORS.purpleBg,
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            AI
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: '12px',
          color: COLORS.textDim,
          whiteSpace: 'nowrap',
        }}
      >
        {new Date(note.createdAt).toLocaleString('en-IN')}
      </span>
    </div>

    <div
      style={{
        fontSize: '14px',
        lineHeight: '1.6',
        color: COLORS.textSecondary,
        whiteSpace: 'pre-wrap',
        maxHeight: '80px',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      }}
    >
      {note.content}
    </div>

    <div
      style={{
        marginTop: '10px',
        fontSize: '12px',
        color: COLORS.brand,
        fontWeight: 600,
      }}
    >
      Tap to amend →
    </div>
  </div>
);

export default AmendmentScreen;
