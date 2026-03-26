import React from 'react';
import type { ClinicalNote } from '../../types/patient';
import { COLORS } from '../../constants/colors';
import { formatClinicalDate } from '../../utils/formatClinical';

/**
 * Displays clinical notes summary for a patient
 * @param notes - Array of clinical notes
 * @returns A chronological list of clinical notes with author and type
 * @clinical-note AI-generated notes are visually distinguished and show approval status
 */
const NotesSummary: React.FC<{ notes: ClinicalNote[] }> = ({ notes }) => {
    return (
        <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📝</span> Clinical Notes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notes.map(note => (
                    <div key={note.id} style={{
                        padding: '16px',
                        backgroundColor: note.isAIGenerated ? COLORS.purpleLight : COLORS.surface,
                        border: `1px solid ${note.isAIGenerated ? COLORS.purpleBorder : COLORS.borderLight}`,
                        borderRadius: '8px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: COLORS.textSecondary, display: 'flex', alignItems: 'center' }}>
                                {note.author}
                                {note.isAIGenerated && <span style={{ marginLeft: '8px', color: COLORS.purple, backgroundColor: COLORS.purpleBg, padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>AI Scribed</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                                {formatClinicalDate(note.createdAt)}
                            </div>
                        </div>
                        <div style={{ fontSize: '14px', color: COLORS.text, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {note.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesSummary;
