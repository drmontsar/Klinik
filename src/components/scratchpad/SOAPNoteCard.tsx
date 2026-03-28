/**
 * SOAPNoteCard — displays and allows inline editing of a structured SOAP note
 * extracted from a handwritten scribble.
 * Reuses the same StructuredSOAPNote type as the voice scribing pipeline.
 */

import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import type { StructuredSOAPNote } from '../../types/clinical';

interface SOAPNoteCardProps {
  note: StructuredSOAPNote;
  onChange: (updated: StructuredSOAPNote) => void;
  onCorrection: () => void;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '6px',
  fontSize: '14px',
  color: COLORS.text,
  backgroundColor: COLORS.surface,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: COLORS.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: '4px',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '10px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const sectionHeaderStyle = (color: string): React.CSSProperties => ({
  padding: '12px 16px',
  backgroundColor: COLORS.bgSubtle,
  borderBottom: `1px solid ${COLORS.borderLight}`,
  fontSize: '13px',
  fontWeight: 700,
  color,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  userSelect: 'none',
});

const sectionBodyStyle: React.CSSProperties = { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' };

const CollapsibleSection: React.FC<{
  icon: string; title: string; color: string; defaultOpen?: boolean; children: React.ReactNode;
}> = ({ icon, title, color, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle(color)} onClick={() => setOpen(o => !o)}>
        <span>{icon}</span><span>{title}</span>
        <span style={{ marginLeft: 'auto', color: COLORS.textDim, fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={sectionBodyStyle}>{children}</div>}
    </div>
  );
};

const EditableText: React.FC<{
  label: string; value: string; onChange: (val: string) => void; multiline?: boolean; rows?: number;
}> = ({ label, value, onChange, multiline = false, rows = 2 }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ ...fieldStyle, resize: 'vertical', lineHeight: '1.5' }} />
    ) : (
      <input type="text" value={value} onChange={e => onChange(e.target.value)} style={fieldStyle} />
    )}
  </div>
);

/** Editable list — each item on its own line */
const EditableList: React.FC<{
  label: string; items: string[]; onChange: (items: string[]) => void; rows?: number;
}> = ({ label, items, onChange, rows = 3 }) => (
  <EditableText
    label={`${label} (one per line)`}
    value={items.join('\n')}
    onChange={val => onChange(val.split('\n').filter(Boolean))}
    multiline rows={rows}
  />
);

const SOAPNoteCard: React.FC<SOAPNoteCardProps> = ({ note, onChange, onCorrection }) => {
  const track = (updater: (prev: StructuredSOAPNote) => StructuredSOAPNote) => {
    onCorrection();
    onChange(updater(note));
  };

  return (
    <div>
      {/* Subjective */}
      <CollapsibleSection icon="🗣️" title="Subjective" color={COLORS.brand}>
        <EditableText label="Chief Complaint" value={note.subjective.chiefComplaint}
          onChange={val => track(prev => ({ ...prev, subjective: { ...prev.subjective, chiefComplaint: val } }))} multiline rows={2} />
        <EditableList label="Symptoms" items={note.subjective.symptoms}
          onChange={items => track(prev => ({ ...prev, subjective: { ...prev.subjective, symptoms: items } }))} />
        <div>
          <label style={labelStyle}>Pain Score (0–10, blank if not assessed)</label>
          <input type="number" min={0} max={10} value={note.subjective.painScore ?? ''}
            onChange={e => track(prev => ({ ...prev, subjective: { ...prev.subjective, painScore: e.target.value ? Number(e.target.value) : null } }))}
            style={{ ...fieldStyle, width: '80px' }} placeholder="—" />
        </div>
        <EditableText label="Patient Statement" value={note.subjective.patientStatement}
          onChange={val => track(prev => ({ ...prev, subjective: { ...prev.subjective, patientStatement: val } }))} multiline rows={2} />
      </CollapsibleSection>

      {/* Objective */}
      <CollapsibleSection icon="🩺" title="Objective" color={COLORS.blue}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {([
            { label: 'Temp (°C)', key: 'temperature' }, { label: 'HR (bpm)', key: 'heartRate' },
            { label: 'SBP (mmHg)', key: 'systolicBP' }, { label: 'DBP (mmHg)', key: 'diastolicBP' },
            { label: 'SpO₂ (%)', key: 'spo2' }, { label: 'RR (/min)', key: 'respiratoryRate' },
          ] as const).map(({ label, key }) => (
            <div key={key}>
              <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>
              <input type="number" value={note.objective[key] ?? ''}
                onChange={e => track(prev => ({ ...prev, objective: { ...prev.objective, [key]: e.target.value ? Number(e.target.value) : null } }))}
                style={{ ...fieldStyle, padding: '6px 8px' }} placeholder="—" />
            </div>
          ))}
        </div>
        <EditableList label="Examination Findings" items={note.objective.findings}
          onChange={items => track(prev => ({ ...prev, objective: { ...prev.objective, findings: items } }))} rows={4} />
      </CollapsibleSection>

      {/* Assessment */}
      <CollapsibleSection icon="🔍" title="Assessment" color={COLORS.amber}>
        <EditableText label="Primary Diagnosis" value={note.assessment.primaryDiagnosis}
          onChange={val => track(prev => ({ ...prev, assessment: { ...prev.assessment, primaryDiagnosis: val } }))} multiline rows={2} />
        <EditableText label="Active Problems Summary" value={note.assessment.activeProblemsSummary}
          onChange={val => track(prev => ({ ...prev, assessment: { ...prev.assessment, activeProblemsSummary: val } }))} multiline rows={2} />
        <EditableText label="Clinical Reasoning" value={note.assessment.clinicalReasoning}
          onChange={val => track(prev => ({ ...prev, assessment: { ...prev.assessment, clinicalReasoning: val } }))} multiline rows={3} />
      </CollapsibleSection>

      {/* Plan — always expanded, prescription is critical */}
      <div style={sectionStyle}>
        <div style={{ ...sectionHeaderStyle(COLORS.green), cursor: 'default' }}>
          <span>📋</span><span>Plan</span>
          {/* SAFETY: Medications require explicit review — never auto-confirmed */}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: COLORS.textDim, fontWeight: 400 }}>Review all orders before signing</span>
        </div>
        <div style={sectionBodyStyle}>
          <EditableList label="Investigations" items={note.plan.investigations}
            onChange={items => track(prev => ({ ...prev, plan: { ...prev.plan, investigations: items, allPlanItems: [...items, ...prev.plan.medications, ...prev.plan.nursing, ...prev.plan.followUp] } }))} rows={3} />
          <EditableList label="Medications" items={note.plan.medications}
            onChange={items => track(prev => ({ ...prev, plan: { ...prev.plan, medications: items, allPlanItems: [...prev.plan.investigations, ...items, ...prev.plan.nursing, ...prev.plan.followUp] } }))} rows={3} />
          <EditableList label="Nursing Instructions" items={note.plan.nursing}
            onChange={items => track(prev => ({ ...prev, plan: { ...prev.plan, nursing: items, allPlanItems: [...prev.plan.investigations, ...prev.plan.medications, ...items, ...prev.plan.followUp] } }))} rows={3} />
          <EditableList label="Follow Up" items={note.plan.followUp}
            onChange={items => track(prev => ({ ...prev, plan: { ...prev.plan, followUp: items, allPlanItems: [...prev.plan.investigations, ...prev.plan.medications, ...prev.plan.nursing, ...items] } }))} rows={2} />
        </div>
      </div>
    </div>
  );
};

export default SOAPNoteCard;
