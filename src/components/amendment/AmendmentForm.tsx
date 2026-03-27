import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import type { ClinicalNote } from '../../types/patient';

/**
 * Amendment form for correcting an approved clinical note.
 * Shows original text, amended text field, and mandatory reason.
 * @param originalNote - The note being amended
 * @param onSubmit - Called with amended text and reason when doctor submits
 * @param onCancel - Called when doctor cancels
 * @clinical-note Amendments are immutable audit entries — originals are never deleted.
 * Wrong patient entries are quarantined, not deleted.
 */
interface AmendmentFormProps {
  originalNote: ClinicalNote;
  onSubmit: (amendedText: string, reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Predefined amendment reasons to speed up the workflow on mobile
const QUICK_REASONS = [
  'Transcription error — incorrect word',
  'Wrong patient — note entered in error',
  'Dose error — incorrect quantity',
  'Clinical update — new information available',
  'Spelling / formatting correction',
];

const AmendmentForm: React.FC<AmendmentFormProps> = ({
  originalNote,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // CLINICAL: All amendments create a new audit record; originals are preserved
  const [amendedText, setAmendedText] = useState(originalNote.content);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const hasChanged = amendedText.trim() !== originalNote.content.trim();

  const handleSubmit = () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    if (!hasChanged) return;
    onSubmit(amendedText, reason);
  };

  const selectQuickReason = (r: string) => {
    setReason(r);
    setReasonError(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Clinical warning banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: COLORS.amberBg,
          border: `1px solid ${COLORS.amberBorder}`,
          borderRadius: '10px',
          fontSize: '13px',
          color: COLORS.amber,
          fontWeight: 500,
          lineHeight: '1.5',
        }}
      >
        ⚠️ Amendments are permanent audit records. The original note is preserved in full.
        Only amend to correct errors — not to add new clinical information (write a new note for that).
      </div>

      {/* Original note — read only */}
      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: COLORS.textMuted,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Original Note
        </div>
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: COLORS.bgMuted,
            borderRadius: '10px',
            border: `1px solid ${COLORS.borderLight}`,
            fontSize: '14px',
            lineHeight: '1.7',
            color: COLORS.textSecondary,
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {originalNote.content}
        </div>
        <div style={{ fontSize: '12px', color: COLORS.textDim, marginTop: '6px' }}>
          Written by {originalNote.author} · {new Date(originalNote.createdAt).toLocaleString('en-IN')}
        </div>
      </div>

      {/* Amended text */}
      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: COLORS.text,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Amended Note
        </div>
        <textarea
          value={amendedText}
          onChange={e => setAmendedText(e.target.value)}
          rows={8}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: `1px solid ${hasChanged ? COLORS.brand : COLORS.borderLight}`,
            borderRadius: '10px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: COLORS.text,
            fontFamily: 'inherit',
            resize: 'vertical',
            backgroundColor: hasChanged ? COLORS.brandSubtle : COLORS.surface,
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {!hasChanged && (
          <div style={{ fontSize: '12px', color: COLORS.textDim, marginTop: '4px' }}>
            Edit the text above to create an amendment.
          </div>
        )}
      </div>

      {/* Reason — mandatory */}
      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: reasonError ? COLORS.red : COLORS.text,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Reason for Amendment {reasonError && '— required'}
        </div>

        {/* Quick reason chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {QUICK_REASONS.map(r => (
            <button
              key={r}
              onClick={() => selectQuickReason(r)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: `1px solid ${reason === r ? COLORS.brand : COLORS.borderLight}`,
                backgroundColor: reason === r ? COLORS.brandSubtle : COLORS.surface,
                color: reason === r ? COLORS.brand : COLORS.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: reason === r ? 600 : 400,
                transition: 'all 0.1s',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={reason}
          onChange={e => {
            setReason(e.target.value);
            if (e.target.value.trim()) setReasonError(false);
          }}
          placeholder="Or type a specific reason..."
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1px solid ${reasonError ? COLORS.red : COLORS.borderLight}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: COLORS.text,
            fontFamily: 'inherit',
            backgroundColor: reasonError ? COLORS.redBg : COLORS.surface,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: '12px 24px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            cursor: 'pointer',
            color: COLORS.textMuted,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!hasChanged || !reason.trim() || isSubmitting}
          style={{
            padding: '12px 28px',
            backgroundColor:
              !hasChanged || !reason.trim() || isSubmitting ? COLORS.borderLight : COLORS.brand,
            color: !hasChanged || !reason.trim() || isSubmitting ? COLORS.textMuted : '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: !hasChanged || !reason.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'background-color 0.15s',
          }}
        >
          {isSubmitting ? 'Saving...' : '✓ Submit Amendment'}
        </button>
      </div>
    </div>
  );
};

export default AmendmentForm;
