/**
 * FollowUpAssessmentCard — displays and allows inline editing of an OPD follow-up assessment.
 * Every field is editable. Prescription section is always expanded.
 */

import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import type { OPFollowUpAssessment } from '../../types/OPFollowUpAssessment';
import type { OPMedication } from '../../types/OPMedication';

interface FollowUpAssessmentCardProps {
  note: OPFollowUpAssessment;
  onChange: (updated: OPFollowUpAssessment) => void;
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

const MedicationRow: React.FC<{
  med: OPMedication; onChange: (updated: OPMedication) => void; onRemove: () => void;
}> = ({ med, onChange, onRemove }) => (
  <div style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: '8px', padding: '10px 12px', backgroundColor: COLORS.bgMuted, position: 'relative' }}>
    <button onClick={onRemove} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: COLORS.textDim, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px 6px' }}>×</button>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
      <div><label style={labelStyle}>Drug</label><input value={med.drug} onChange={e => onChange({ ...med, drug: e.target.value })} style={fieldStyle} /></div>
      <div><label style={labelStyle}>Dose</label><input value={med.dose} onChange={e => onChange({ ...med, dose: e.target.value })} style={fieldStyle} /></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      <div>
        <label style={labelStyle}>Route</label>
        <select value={med.route} onChange={e => onChange({ ...med, route: e.target.value as OPMedication['route'] })} style={fieldStyle}>
          <option value="oral">Oral</option><option value="IV">IV</option><option value="IM">IM</option>
          <option value="SC">SC</option><option value="topical">Topical</option><option value="other">Other</option>
        </select>
      </div>
      <div><label style={labelStyle}>Frequency</label><input value={med.frequency} onChange={e => onChange({ ...med, frequency: e.target.value })} style={fieldStyle} placeholder="OD / BD" /></div>
      <div><label style={labelStyle}>Duration</label><input value={med.duration} onChange={e => onChange({ ...med, duration: e.target.value })} style={fieldStyle} placeholder="1 month" /></div>
    </div>
    <div><label style={labelStyle}>Instructions</label><input value={med.instructions ?? ''} onChange={e => onChange({ ...med, instructions: e.target.value || null })} style={fieldStyle} placeholder="After food, etc." /></div>
  </div>
);

const FollowUpAssessmentCard: React.FC<FollowUpAssessmentCardProps> = ({ note, onChange, onCorrection }) => {
  const track = (updater: (prev: OPFollowUpAssessment) => OPFollowUpAssessment) => {
    onCorrection();
    onChange(updater(note));
  };

  const hasAllergyWarning = note.patientInstructions.some(i => i.toLowerCase().includes('allergy alert'));

  const addMedication = () => {
    const newMed: OPMedication = { id: `med-${Date.now()}`, drug: '', dose: '', route: 'oral', frequency: 'OD', duration: '', instructions: null };
    track(prev => ({ ...prev, prescription: { medications: [...prev.prescription.medications, newMed] } }));
  };

  const progressColor = (p: string) =>
    p === 'improved' ? COLORS.green : p === 'worse' ? COLORS.red : COLORS.amber;

  return (
    <div>
      {hasAllergyWarning && (
        <div style={{ backgroundColor: '#FEE2E2', border: `1px solid ${COLORS.red}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: COLORS.red }}>
          ⚠ Allergy conflict detected — review prescription before signing
        </div>
      )}

      {/* Interval History */}
      <CollapsibleSection icon="📋" title="Interval History" color={COLORS.brand}>
        <EditableText label="Chief Complaint / Reason for Visit" value={note.intervalHistory.complaint}
          onChange={val => track(prev => ({ ...prev, intervalHistory: { ...prev.intervalHistory, complaint: val } }))} multiline rows={2} />

        <div>
          <label style={labelStyle}>Progress Since Last Visit</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['improved', 'same', 'worse'] as const).map(p => (
              <button key={p} onClick={() => track(prev => ({ ...prev, intervalHistory: { ...prev.intervalHistory, progressSinceLastVisit: p } }))}
                style={{ flex: 1, padding: '8px', border: `2px solid ${note.intervalHistory.progressSinceLastVisit === p ? progressColor(p) : COLORS.borderLight}`, borderRadius: '6px', backgroundColor: note.intervalHistory.progressSinceLastVisit === p ? (p === 'improved' ? '#DCFCE7' : p === 'worse' ? '#FEE2E2' : '#FEF3C7') : COLORS.surface, color: note.intervalHistory.progressSinceLastVisit === p ? progressColor(p) : COLORS.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                {p === 'improved' ? '↑ ' : p === 'worse' ? '↓ ' : '→ '}{p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Medication Compliance</label>
          <select value={note.intervalHistory.medicationCompliance ?? ''} onChange={e => track(prev => ({ ...prev, intervalHistory: { ...prev.intervalHistory, medicationCompliance: (e.target.value as OPFollowUpAssessment['intervalHistory']['medicationCompliance']) || null } }))} style={fieldStyle}>
            <option value="">Unknown</option>
            <option value="compliant">Compliant</option>
            <option value="partial">Partial</option>
            <option value="non-compliant">Non-compliant</option>
          </select>
        </div>
      </CollapsibleSection>

      {/* Examination */}
      <CollapsibleSection icon="🩺" title="Examination" color={COLORS.blue}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {([
            { label: 'Temp (°C)', key: 'temperature' }, { label: 'HR (bpm)', key: 'heartRate' },
            { label: 'SBP', key: 'systolicBP' }, { label: 'DBP', key: 'diastolicBP' },
            { label: 'SpO₂ (%)', key: 'spo2' }, { label: 'RR (/min)', key: 'respiratoryRate' },
            { label: 'Wt (kg)', key: 'weight' },
          ] as const).map(({ label, key }) => (
            <div key={key}>
              <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>
              <input type="number" value={note.examination.vitals[key] ?? ''} onChange={e => track(prev => ({ ...prev, examination: { ...prev.examination, vitals: { ...prev.examination.vitals, [key]: e.target.value ? Number(e.target.value) : null } } }))} style={{ ...fieldStyle, padding: '6px 8px' }} placeholder="—" />
            </div>
          ))}
        </div>
        <EditableText label="Relevant Findings (one per line)" value={note.examination.relevantFindings.join('\n')}
          onChange={val => track(prev => ({ ...prev, examination: { ...prev.examination, relevantFindings: val.split('\n').filter(Boolean) } }))} multiline rows={3} />
      </CollapsibleSection>

      {/* Investigation Results */}
      <CollapsibleSection icon="📊" title="Investigation Results" color={COLORS.textSecondary}>
        <EditableText label="Results Reviewed (one per line)" value={note.investigationResults.reviewed.join('\n')}
          onChange={val => track(prev => ({ ...prev, investigationResults: { ...prev.investigationResults, reviewed: val.split('\n').filter(Boolean) } }))} multiline rows={3} />
        <EditableText label="Interpretation" value={note.investigationResults.interpretation ?? ''}
          onChange={val => track(prev => ({ ...prev, investigationResults: { ...prev.investigationResults, interpretation: val || null } }))} multiline rows={2} />
      </CollapsibleSection>

      {/* Diagnosis */}
      <CollapsibleSection icon="🔍" title="Diagnosis" color={COLORS.amber}>
        <EditableText label="Primary Diagnosis" value={note.diagnosis.primary}
          onChange={val => track(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, primary: val } }))} />
        <EditableText label="Progress Note" value={note.diagnosis.progressNote}
          onChange={val => track(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, progressNote: val } }))} />
      </CollapsibleSection>

      {/* Prescription — always expanded */}
      <div style={sectionStyle}>
        <div style={{ ...sectionHeaderStyle(COLORS.green), cursor: 'default' }}>
          <span>💊</span><span>Prescription</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: COLORS.textDim, fontWeight: 400 }}>Review all medications before signing</span>
        </div>
        <div style={sectionBodyStyle}>
          {note.prescription.medications.length === 0 && (
            <div style={{ fontSize: '13px', color: COLORS.textDim, textAlign: 'center', padding: '8px 0' }}>No medications — add below</div>
          )}
          {note.prescription.medications.map((med, idx) => (
            <MedicationRow key={med.id} med={med}
              onChange={updated => track(prev => { const meds = [...prev.prescription.medications]; meds[idx] = updated; return { ...prev, prescription: { medications: meds } }; })}
              onRemove={() => track(prev => ({ ...prev, prescription: { medications: prev.prescription.medications.filter((_, i) => i !== idx) } }))} />
          ))}
          <button onClick={addMedication} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: `1px dashed ${COLORS.brand}`, borderRadius: '8px', color: COLORS.brand, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Medication</button>
        </div>
      </div>

      {/* Investigations Ordered */}
      <CollapsibleSection icon="🔬" title="New Investigations" color={COLORS.blue}>
        <EditableText label="Tests Ordered (one per line)" value={note.investigations.ordered.join('\n')}
          onChange={val => track(prev => ({ ...prev, investigations: { ...prev.investigations, ordered: val.split('\n').filter(Boolean) } }))} multiline rows={3} />
      </CollapsibleSection>

      {/* Patient Instructions */}
      <CollapsibleSection icon="📝" title="Patient Instructions" color={COLORS.textSecondary}>
        <EditableText label="Instructions (one per line)" value={note.patientInstructions.join('\n')}
          onChange={val => track(prev => ({ ...prev, patientInstructions: val.split('\n').filter(Boolean) }))} multiline rows={3} />
      </CollapsibleSection>

      {/* Follow Up */}
      <CollapsibleSection icon="📅" title="Follow Up" color={COLORS.textSecondary}>
        <EditableText label="Follow-up Interval" value={note.followUp.interval}
          onChange={val => track(prev => ({ ...prev, followUp: { ...prev.followUp, interval: val } }))} />
        <EditableText label="Condition / Instructions" value={note.followUp.condition ?? ''}
          onChange={val => track(prev => ({ ...prev, followUp: { ...prev.followUp, condition: val || null } }))} />
      </CollapsibleSection>
    </div>
  );
};

export default FollowUpAssessmentCard;
