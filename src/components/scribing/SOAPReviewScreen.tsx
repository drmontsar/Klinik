import React, { useState } from 'react';
import type { SOAPNote } from '../../types/clinical';
import { COLORS } from '../../constants/colors';

/**
 * Review screen for AI-generated SOAP notes before clinician approval.
 * Each section is editable. Clinician MUST approve before note is finalised.
 * @param soapNote - The AI-generated SOAP note
 * @param providerName - Name of the AI provider that generated the note
 * @param onUpdateSection - Callback to update a SOAP section
 * @param onApprove - Callback when clinician approves the note
 * @param onReject - Callback when clinician rejects the note
 * @param isGenerating - Whether SOAP is still being generated
 * @clinical-note Clinician MUST review and approve before note is finalised
 */
interface SOAPReviewProps {
    soapNote: SOAPNote | null;
    providerName: string;
    onUpdateSection: (section: keyof SOAPNote, content: string) => void;
    onApprove: () => void;
    onReject: () => void;
    isGenerating: boolean;
    generateError: string | null;
}

const SECTION_LABELS: Record<keyof SOAPNote, { label: string; icon: string; description: string }> = {
    subjective: { label: 'Subjective', icon: '🗣️', description: "Patient's reported symptoms and concerns" },
    objective: { label: 'Objective', icon: '🔬', description: 'Clinical findings, vitals, observations' },
    assessment: { label: 'Assessment', icon: '🧠', description: 'Clinical interpretation and differential' },
    plan: { label: 'Plan', icon: '📋', description: 'Actions, orders, follow-up' },
};

const SOAPReviewScreen: React.FC<SOAPReviewProps> = ({
    soapNote,
    providerName,
    onUpdateSection,
    onApprove,
    onReject,
    isGenerating,
    generateError,
}) => {
    const [editingSection, setEditingSection] = useState<keyof SOAPNote | null>(null);

    if (isGenerating) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.text, marginBottom: '8px' }}>
                    Generating SOAP Note...
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textMuted }}>
                    Using {providerName}
                </div>
                <div style={{ width: '200px', height: '4px', backgroundColor: COLORS.borderLight, borderRadius: '2px', margin: '20px auto', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', backgroundColor: COLORS.brand, borderRadius: '2px', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                </div>
                <style>{`
                    @keyframes shimmer { 0% { width: 20%; } 50% { width: 80%; } 100% { width: 20%; } }
                `}</style>
            </div>
        );
    }

    if (generateError) {
        return (
            <div style={{ padding: '20px', backgroundColor: COLORS.redBg, borderRadius: '12px', border: `1px solid ${COLORS.redBorder}` }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.red, marginBottom: '8px' }}>
                    ⚠️ SOAP Generation Failed
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>{generateError}</div>
                <button onClick={onReject} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '8px', cursor: 'pointer', color: COLORS.text, fontSize: '14px' }}>
                    ← Back to Recording
                </button>
            </div>
        );
    }

    if (!soapNote) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: COLORS.text }}>
                        📝 SOAP Note Review
                    </h3>
                    <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
                        Review and edit before approving. Click any section to edit.
                    </div>
                </div>
                <span style={{ fontSize: '12px', color: COLORS.purple, backgroundColor: COLORS.purpleBg, padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                    AI: {providerName}
                </span>
            </div>

            {/* SOAP Sections */}
            {(Object.keys(SECTION_LABELS) as Array<keyof SOAPNote>).map(section => {
                const { label, icon, description } = SECTION_LABELS[section];
                const isEditing = editingSection === section;

                return (
                    <div key={section} style={{
                        padding: '16px',
                        backgroundColor: COLORS.surface,
                        borderRadius: '12px',
                        border: `1px solid ${isEditing ? COLORS.brand : COLORS.borderLight}`,
                        transition: 'border-color 0.2s',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <span style={{ fontSize: '16px', marginRight: '8px' }}>{icon}</span>
                                <span style={{ fontWeight: 600, fontSize: '16px', color: COLORS.text }}>{label}</span>
                                <span style={{ fontSize: '12px', color: COLORS.textMuted, marginLeft: '8px' }}>{description}</span>
                            </div>
                            <button
                                onClick={() => setEditingSection(isEditing ? null : section)}
                                style={{ fontSize: '12px', color: COLORS.brand, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                            >
                                {isEditing ? '✓ Done' : '✎ Edit'}
                            </button>
                        </div>

                        {isEditing ? (
                            <textarea
                                value={soapNote[section]}
                                onChange={(e) => onUpdateSection(section, e.target.value)}
                                style={{
                                    width: '100%', minHeight: '100px', padding: '12px',
                                    border: `1px solid ${COLORS.brandBorder}`, borderRadius: '8px',
                                    fontSize: '14px', lineHeight: '1.6', color: COLORS.text,
                                    fontFamily: 'inherit', resize: 'vertical',
                                    backgroundColor: COLORS.brandSubtle,
                                }}
                            />
                        ) : (
                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: COLORS.textSecondary, whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                                onClick={() => setEditingSection(section)}>
                                {soapNote[section]}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button onClick={onReject} style={{
                    padding: '12px 24px', backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px',
                    cursor: 'pointer', color: COLORS.textMuted, fontSize: '14px', fontWeight: 500,
                }}>
                    ✕ Discard & Re-record
                </button>
                <button onClick={onApprove} style={{
                    padding: '12px 32px', backgroundColor: COLORS.green,
                    color: COLORS.surface, border: 'none', borderRadius: '12px',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}>
                    ✓ Approve & Save Note
                </button>
            </div>
        </div>
    );
};

export default SOAPReviewScreen;
