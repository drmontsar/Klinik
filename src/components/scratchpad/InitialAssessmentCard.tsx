/**
 * InitialAssessmentCard — displays and allows inline editing of an OPD initial assessment.
 * Every field is editable. The prescription section is always expanded.
 * manualCorrectionsCount is tracked silently and never shown to the doctor.
 */

import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import type { OPInitialAssessment } from '../../types/OPInitialAssessment';
import type { OPMedication } from '../../types/OPMedication';

interface InitialAssessmentCardProps {
  note: OPInitialAssessment;
  onChange: (updated: OPInitialAssessment) => void;
  onCorrection: () => void;
}

// ---------------------------------------------------------------------------
// Small reusable field components
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

const CollapsibleSection: React.FC<{
  icon: string;
  title: string;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ icon, title, color, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle(color)} onClick={() => setOpen(o => !o)}>
        <span>{icon}</span>
        <span>{title}</span>
        <span style={{ marginLeft: 'auto', color: COLORS.textDim, fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={sectionBodyStyle}>{children}</div>}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Inline editable text area
// ---------------------------------------------------------------------------

const EditableText: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  rows?: number;
}> = ({ label, value, onChange, multiline = false, rows = 2 }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ ...fieldStyle, resize: 'vertical', lineHeight: '1.5', minHeight: `${rows * 22}px` }}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={fieldStyle}
      />
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Medication row — all 5 fields editable inline
// ---------------------------------------------------------------------------

const MedicationRow: React.FC<{
  med: OPMedication;
  onChange: (updated: OPMedication) => void;
  onRemove: () => void;
}> = ({ med, onChange, onRemove }) => (
  <div style={{
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: '8px',
    padding: '10px 12px',
    backgroundColor: COLORS.bgMuted,
    position: 'relative',
  }}>
    <button
      onClick={onRemove}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'none',
        border: 'none',
        color: COLORS.textDim,
        cursor: 'pointer',
        fontSize: '16px',
        lineHeight: 1,
        padding: '2px 6px',
      }}
      title="Remove medication"
    >
      ×
    </button>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
      <div>
        <label style={labelStyle}>Drug</label>
        <input value={med.drug} onChange={e => onChange({ ...med, drug: e.target.value })} style={fieldStyle} />
      </div>
      <div>
        <label style={labelStyle}>Dose</label>
        <input value={med.dose} onChange={e => onChange({ ...med, dose: e.target.value })} style={fieldStyle} />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
      <div>
        <label style={labelStyle}>Route</label>
        <select value={med.route} onChange={e => onChange({ ...med, route: e.target.value as OPMedication['route'] })} style={fieldStyle}>
          <option value="oral">Oral</option>
          <option value="IV">IV</option>
          <option value="IM">IM</option>
          <option value="SC">SC</option>
          <option value="topical">Topical</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Frequency</label>
        <input value={med.frequency} onChange={e => onChange({ ...med, frequency: e.target.value })} style={fieldStyle} placeholder="OD / BD / TDS" />
      </div>
      <div>
        <label style={labelStyle}>Duration</label>
        <input value={med.duration} onChange={e => onChange({ ...med, duration: e.target.value })} style={fieldStyle} placeholder="5 days" />
      </div>
    </div>

    <div>
      <label style={labelStyle}>Instructions</label>
      <input
        value={med.instructions ?? ''}
        onChange={e => onChange({ ...med, instructions: e.target.value || null })}
        style={fieldStyle}
        placeholder="After food, with water, etc."
      />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

const InitialAssessmentCard: React.FC<InitialAssessmentCardProps> = ({ note, onChange, onCorrection }) => {
  const track = (updater: (prev: OPInitialAssessment) => OPInitialAssessment) => {
    onCorrection();
    onChange(updater(note));
  };

  const hasAllergyWarning = note.patientInstructions.some(i =>
    i.toLowerCase().includes('allergy alert')
  );

  const addMedication = () => {
    const newMed: OPMedication = {
      id: `med-${Date.now()}`,
      drug: '',
      dose: '',
      route: 'oral',
      frequency: 'OD',
      duration: '',
      instructions: null,
    };
    track(prev => ({
      ...prev,
      prescription: { medications: [...prev.prescription.medications, newMed] },
    }));
  };

  const updateMedication = (idx: number, updated: OPMedication) => {
    track(prev => {
      const meds = [...prev.prescription.medications];
      meds[idx] = updated;
      return { ...prev, prescription: { medications: meds } };
    });
  };

  const removeMedication = (idx: number) => {
    track(prev => ({
      ...prev,
      prescription: { medications: prev.prescription.medications.filter((_, i) => i !== idx) },
    }));
  };

  return (
    <div>
      {/* Allergy alert banner */}
      {hasAllergyWarning && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: `1px solid ${COLORS.red}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: COLORS.red,
        }}>
          ⚠ Allergy conflict detected — review prescription before signing
        </div>
      )}

      {/* Chief Complaint */}
      <CollapsibleSection icon="🗣️" title="Chief Complaint" color={COLORS.brand}>
        <EditableText
          label="Chief Complaint"
          value={note.chiefComplaint}
          onChange={val => track(prev => ({ ...prev, chiefComplaint: val }))}
          multiline
          rows={2}
        />
      </CollapsibleSection>

      {/* History */}
      <CollapsibleSection icon="📖" title="History" color={COLORS.textSecondary}>
        <EditableText
          label="History of Presenting Illness"
          value={note.history.presentingIllness}
          onChange={val => track(prev => ({ ...prev, history: { ...prev.history, presentingIllness: val } }))}
          multiline rows={3}
        />
        <EditableText
          label="Relevant Past History"
          value={note.history.relevantPastHistory}
          onChange={val => track(prev => ({ ...prev, history: { ...prev.history, relevantPastHistory: val } }))}
          multiline rows={2}
        />
        <EditableText
          label="Family History"
          value={note.history.familyHistory ?? ''}
          onChange={val => track(prev => ({ ...prev, history: { ...prev.history, familyHistory: val || null } }))}
        />
        <EditableText
          label="Allergies (comma-separated)"
          value={note.history.allergies.join(', ')}
          onChange={val => track(prev => ({
            ...prev,
            history: { ...prev.history, allergies: val.split(',').map(s => s.trim()).filter(Boolean) },
          }))}
        />
      </CollapsibleSection>

      {/* Examination & Vitals */}
      <CollapsibleSection icon="🩺" title="Examination" color={COLORS.blue}>
        <EditableText
          label="General Appearance"
          value={note.examination.generalAppearance}
          onChange={val => track(prev => ({ ...prev, examination: { ...prev.examination, generalAppearance: val } }))}
          multiline rows={2}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {([
            { label: 'Temp (°C)', key: 'temperature' },
            { label: 'HR (bpm)', key: 'heartRate' },
            { label: 'SBP', key: 'systolicBP' },
            { label: 'DBP', key: 'diastolicBP' },
            { label: 'SpO₂ (%)', key: 'spo2' },
            { label: 'RR (/min)', key: 'respiratoryRate' },
            { label: 'Wt (kg)', key: 'weight' },
            { label: 'Ht (cm)', key: 'height' },
          ] as const).map(({ label, key }) => (
            <div key={key}>
              <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>
              <input
                type="number"
                value={note.examination.vitals[key] ?? ''}
                onChange={e => track(prev => ({
                  ...prev,
                  examination: {
                    ...prev.examination,
                    vitals: { ...prev.examination.vitals, [key]: e.target.value ? Number(e.target.value) : null },
                  },
                }))}
                style={{ ...fieldStyle, padding: '6px 8px' }}
                placeholder="—"
              />
            </div>
          ))}
        </div>
        <EditableText
          label="Systemic Findings (one per line)"
          value={note.examination.systemicFindings.join('\n')}
          onChange={val => track(prev => ({
            ...prev,
            examination: { ...prev.examination, systemicFindings: val.split('\n').filter(Boolean) },
          }))}
          multiline rows={3}
        />
      </CollapsibleSection>

      {/* Diagnosis */}
      <CollapsibleSection icon="🔍" title="Diagnosis" color={COLORS.amber}>
        <EditableText
          label="Primary Diagnosis"
          value={note.diagnosis.primary}
          onChange={val => track(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, primary: val } }))}
          multiline rows={2}
        />
        <EditableText
          label="Secondary Diagnoses (one per line)"
          value={note.diagnosis.secondary.join('\n')}
          onChange={val => track(prev => ({
            ...prev,
            diagnosis: { ...prev.diagnosis, secondary: val.split('\n').filter(Boolean) },
          }))}
          multiline rows={2}
        />
      </CollapsibleSection>

      {/* Prescription — always expanded, never collapsible */}
      <div style={sectionStyle}>
        <div style={{ ...sectionHeaderStyle(COLORS.green), cursor: 'default' }}>
          <span>💊</span>
          <span>Prescription</span>
          {/* SAFETY: Reminder that medications are draft until signed */}
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: COLORS.textDim, fontWeight: 400 }}>
            Review all medications before signing
          </span>
        </div>
        <div style={sectionBodyStyle}>
          {note.prescription.medications.length === 0 && (
            <div style={{ fontSize: '13px', color: COLORS.textDim, textAlign: 'center', padding: '8px 0' }}>
              No medications — add below
            </div>
          )}
          {note.prescription.medications.map((med, idx) => (
            <MedicationRow
              key={med.id}
              med={med}
              onChange={updated => updateMedication(idx, updated)}
              onRemove={() => removeMedication(idx)}
            />
          ))}
          <button
            onClick={addMedication}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: `1px dashed ${COLORS.brand}`,
              borderRadius: '8px',
              color: COLORS.brand,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Add Medication
          </button>
        </div>
      </div>

      {/* Investigations */}
      <CollapsibleSection icon="🔬" title="Investigations" color={COLORS.blue}>
        <EditableText
          label="Tests Ordered (one per line)"
          value={note.investigations.ordered.join('\n')}
          onChange={val => track(prev => ({
            ...prev,
            investigations: { ...prev.investigations, ordered: val.split('\n').filter(Boolean) },
          }))}
          multiline rows={3}
        />
        <div>
          <label style={labelStyle}>Urgency</label>
          <select
            value={note.investigations.urgency}
            onChange={e => track(prev => ({
              ...prev,
              investigations: { ...prev.investigations, urgency: e.target.value as 'routine' | 'urgent' | 'stat' },
            }))}
            style={fieldStyle}
          >
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </select>
        </div>
      </CollapsibleSection>

      {/* Patient Instructions */}
      <CollapsibleSection icon="📝" title="Patient Instructions" color={COLORS.textSecondary}>
        <EditableText
          label="Instructions (one per line)"
          value={note.patientInstructions.join('\n')}
          onChange={val => track(prev => ({
            ...prev,
            patientInstructions: val.split('\n').filter(Boolean),
          }))}
          multiline rows={3}
        />
      </CollapsibleSection>

      {/* Follow Up */}
      <CollapsibleSection icon="📅" title="Follow Up" color={COLORS.textSecondary}>
        <EditableText
          label="Follow-up Interval"
          value={note.followUp.interval}
          onChange={val => track(prev => ({ ...prev, followUp: { ...prev.followUp, interval: val } }))}
        />
        <EditableText
          label="Condition / Instructions"
          value={note.followUp.condition ?? ''}
          onChange={val => track(prev => ({ ...prev, followUp: { ...prev.followUp, condition: val || null } }))}
        />
      </CollapsibleSection>

      {/* Referral */}
      <CollapsibleSection icon="🏥" title="Referral" color={COLORS.textSecondary} defaultOpen={note.referral.needed}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={note.referral.needed}
              onChange={e => track(prev => ({ ...prev, referral: { ...prev.referral, needed: e.target.checked } }))}
            />
            Referral needed
          </label>
        </div>
        {note.referral.needed && (
          <>
            <EditableText
              label="Specialty"
              value={note.referral.specialty ?? ''}
              onChange={val => track(prev => ({ ...prev, referral: { ...prev.referral, specialty: val || null } }))}
            />
            <EditableText
              label="Reason"
              value={note.referral.reason ?? ''}
              onChange={val => track(prev => ({ ...prev, referral: { ...prev.referral, reason: val || null } }))}
              multiline rows={2}
            />
          </>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default InitialAssessmentCard;
