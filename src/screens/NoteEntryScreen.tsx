import React, { useState, useCallback, useMemo } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import type { StructuredSOAPNote } from '../types/clinical';
import QuickPlanEntry from '../components/scribing/QuickPlanEntry';
import TemplateEntry from '../components/scribing/TemplateEntry';
import NaturalLanguageEntry from '../components/scribing/NaturalLanguageEntry';
import SOAPReviewScreen from '../components/scribing/SOAPReviewScreen';
import type { ConfirmedPlanItems } from '../components/scribing/SOAPReviewScreen';
import useSOAPGenerator from '../hooks/useSOAPGenerator';
import { createRepository } from '../services/createRepository';
import { getDoctorProfile } from '../services/doctorProfile';

/**
 * Note entry screen — three typed modes for writing clinical notes.
 * Quick Plan: assessment + plan items only (fastest).
 * Full Template: complete SOAP form with vitals.
 * Natural Language: free text → Claude → structured SOAP.
 * All modes route to SOAPReviewScreen before saving.
 *
 * @param patient - The patient being documented
 * @param onBack - Return to patient detail
 * @param onComplete - Called after note is saved (re-loads patient data)
 */

type NoteMode = 'quick' | 'template' | 'natural';
type EntryPhase = 'entry' | 'review';

const MODES: { key: NoteMode; label: string; icon: string; description: string }[] = [
  { key: 'quick', label: 'Quick Plan', icon: '⚡', description: 'Assessment + plan items only' },
  { key: 'template', label: 'Full Template', icon: '📝', description: 'Complete SOAP form' },
  { key: 'natural', label: 'Type to AI', icon: '🧠', description: 'Free text → Claude' },
];

const NoteEntryScreen: React.FC<{
  patient: Patient;
  onBack: () => void;
  onComplete: () => void;
}> = ({ patient, onBack, onComplete }) => {
  const [mode, setMode] = useState<NoteMode>('quick');
  const [phase, setPhase] = useState<EntryPhase>('entry');
  const [manualNote, setManualNote] = useState<StructuredSOAPNote | null>(null);

  const soapGenerator = useSOAPGenerator();
  const repository = useMemo(() => createRepository(), []);

  // Patient context string passed to AI for NL mode
  const patientContext = useMemo(() => (
    `Name: ${patient.name}, Age: ${patient.age}, Sex: ${patient.sex}
Diagnosis: ${patient.diagnosis}
Day of Stay: ${patient.dayOfStay}
Active Problems: ${patient.problems.join('; ')}
Current Medications: ${patient.medications.filter(m => m.isActive).map(m => `${m.name} ${m.dose} ${m.route}`).join('; ')}`
  ), [patient]);

  // Quick Plan / Template: note assembled locally, no AI needed
  const handleManualSubmit = useCallback((note: StructuredSOAPNote) => {
    setManualNote(note);
    setPhase('review');
  }, []);

  // Natural Language: send to Claude
  const handleNLGenerate = useCallback(async (text: string) => {
    await soapGenerator.generateSOAP(text, patientContext, 0);
    setPhase('review');
  }, [soapGenerator, patientContext]);

  // Which SOAP note to review depends on mode
  const activeNote = mode === 'natural' ? soapGenerator.soapNote : manualNote;
  const isGenerating = mode === 'natural' ? soapGenerator.isGenerating : false;
  const generateError = mode === 'natural' ? soapGenerator.error : null;
  const providerName = mode === 'natural' ? soapGenerator.providerName : 'Typed';

  // CLINICAL: handleApprove saves only doctor-confirmed plan items.
  const handleApprove = useCallback(async (confirmedItems: ConfirmedPlanItems) => {
    if (!activeNote) return;

    const note = activeNote.displayNote;
    const planLines = [
      ...confirmedItems.investigations.map(i => `• [Investigation] ${i}`),
      ...confirmedItems.medications.map(m => `• [Medication] ${m}`),
      ...confirmedItems.nursing.map(n => `• [Nursing] ${n}`),
      ...confirmedItems.followUp.map(f => `• [Follow-up] ${f}`),
    ];

    const content = [
      note.subjective && `**Subjective:** ${note.subjective}`,
      note.objective && `**Objective:** ${note.objective}`,
      `**Assessment:** ${note.assessment}`,
      `**Plan:**\n${planLines.join('\n')}`,
    ].filter(Boolean).join('\n\n');

    await repository.addNote(patient.id, {
      id: `N-${Date.now()}`,
      author: getDoctorProfile()?.doctorName ?? 'Doctor',
      content,
      type: 'ward-round',
      isAIGenerated: mode === 'natural',
      createdAt: new Date().toISOString(),
      isApproved: true,
    });

    onComplete();
  }, [activeNote, repository, patient.id, mode, onComplete]);

  const handleReject = useCallback(() => {
    setManualNote(null);
    soapGenerator.reset();
    setPhase('entry');
  }, [soapGenerator]);

  const handleUpdateDisplayNote = useCallback((
    section: keyof StructuredSOAPNote['displayNote'],
    content: string
  ) => {
    if (mode === 'natural') {
      soapGenerator.updateDisplayNote(section, content);
    } else {
      setManualNote(prev => prev
        ? { ...prev, displayNote: { ...prev.displayNote, [section]: content } }
        : null
      );
    }
  }, [mode, soapGenerator]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: COLORS.bgSubtle }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', zIndex: 10, padding: '16px 24px', borderBottom: `1px solid ${COLORS.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLORS.textTertiary, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          ← Back to Patient
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>✍️ Write Note</div>
      </div>

      {/* Patient context bar */}
      <div style={{ padding: '10px 24px', backgroundColor: COLORS.brandSubtle, borderBottom: `1px solid ${COLORS.brandBorder}`, fontSize: '14px', color: COLORS.textSecondary }}>
        <strong style={{ color: COLORS.text }}>{patient.name}</strong>
        <span style={{ marginLeft: '8px' }}>— {patient.diagnosis}</span>
        <span style={{ marginLeft: '8px', color: COLORS.textMuted }}>Day {patient.dayOfStay}</span>
      </div>

      <div style={{ padding: '24px' }}>

        {phase === 'entry' && (
          <>
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '12px 16px',
                    backgroundColor: mode === m.key ? COLORS.brand : COLORS.surface,
                    color: mode === m.key ? COLORS.surface : COLORS.textSecondary,
                    border: `1px solid ${mode === m.key ? COLORS.brand : COLORS.borderLight}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{m.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{m.description}</div>
                </button>
              ))}
            </div>

            {/* Active entry mode */}
            {mode === 'quick' && <QuickPlanEntry onSubmit={handleManualSubmit} />}
            {mode === 'template' && <TemplateEntry onSubmit={handleManualSubmit} />}
            {mode === 'natural' && (
              <NaturalLanguageEntry
                onGenerate={handleNLGenerate}
                isGenerating={soapGenerator.isGenerating}
                error={soapGenerator.error}
              />
            )}
          </>
        )}

        {phase === 'review' && (
          <SOAPReviewScreen
            soapNote={activeNote}
            providerName={providerName}
            consultationDurationSeconds={0}
            onUpdateDisplayNote={handleUpdateDisplayNote}
            onApprove={handleApprove}
            onReject={handleReject}
            isGenerating={isGenerating}
            generateError={generateError}
          />
        )}
      </div>
    </div>
  );
};

export default NoteEntryScreen;
