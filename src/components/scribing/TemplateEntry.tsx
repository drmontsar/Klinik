import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import SectionHeader from './SectionHeader';
import TemplateField from './TemplateField';
import PlanTagInput from './PlanTagInput';
import { assembleTemplateNote } from '../../utils/assembleSOAPNote';
import type { StructuredSOAPNote } from '../../types/clinical';

/**
 * Standard Template entry mode — full SOAP form.
 * Each field shows inline clinical suggestions when focused.
 * Delegates note assembly to assembleTemplateNote utility.
 * @param onSubmit - Called with assembled SOAP note when ready to review
 */
interface TemplateEntryProps {
  onSubmit: (note: StructuredSOAPNote) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '8px', fontSize: '14px', color: COLORS.text,
  backgroundColor: COLORS.surface, fontFamily: 'inherit', boxSizing: 'border-box',
};

const TemplateEntry: React.FC<TemplateEntryProps> = ({ onSubmit }) => {
  // Subjective
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [painScore, setPainScore] = useState('');
  // Objective — vitals
  const [temp, setTemp] = useState('');
  const [hr, setHr] = useState('');
  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [rr, setRr] = useState('');
  const [findings, setFindings] = useState('');
  // Assessment
  const [diagnosis, setDiagnosis] = useState('');
  const [reasoning, setReasoning] = useState('');
  // Plan — tag arrays
  const [investigations, setInvestigations] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [nursing, setNursing] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit(assembleTemplateNote({
      chiefComplaint, symptoms, painScore,
      temp, hr, sbp, dbp, spo2, rr, findings,
      diagnosis, reasoning,
      // Join tag arrays back to newline-delimited strings for assembler
      investigations: investigations.join('\n'),
      medications: medications.join('\n'),
      nursing: nursing.join('\n'),
      followUp: followUp.join('\n'),
    }));
  };

  const canSubmit = diagnosis.trim() || chiefComplaint.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Subjective */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="🗣️" label="Subjective" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TemplateField
            label="Chief Complaint"
            value={chiefComplaint}
            onChange={setChiefComplaint}
            category="symptoms"
            placeholder="e.g. Pain at surgical site, nausea"
          />
          <TemplateField
            label="Symptoms"
            value={symptoms}
            onChange={setSymptoms}
            category="symptoms"
            multiline
            rows={2}
            placeholder="e.g. Pain, Nausea, Fever, Rigors"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>Pain Score (0–10)</label>
            {/* SAFETY: type="number" enforces numeric-only vital sign input */}
            <input type="number" min={0} max={10} value={painScore} onChange={e => setPainScore(e.target.value)} placeholder="—" style={{ ...inputStyle, width: '80px' }} />
          </div>
        </div>
      </div>

      {/* Objective */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="🔬" label="Objective" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {[
            { label: 'Temp (°C)', val: temp, set: setTemp },
            { label: 'HR (bpm)', val: hr, set: setHr },
            { label: 'SBP (mmHg)', val: sbp, set: setSbp },
            { label: 'DBP (mmHg)', val: dbp, set: setDbp },
            { label: 'SpO₂ (%)', val: spo2, set: setSpo2 },
            { label: 'RR (/min)', val: rr, set: setRr },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ fontSize: '11px', color: COLORS.textMuted, display: 'block', marginBottom: '3px' }}>{label}</label>
              {/* SAFETY: type="number" enforces numeric-only vital sign input */}
              <input type="number" value={val} onChange={e => set(e.target.value)} placeholder="—" style={{ ...inputStyle, padding: '7px 10px' }} />
            </div>
          ))}
        </div>
        <TemplateField
          label="Examination Findings"
          value={findings}
          onChange={setFindings}
          category="examination"
          multiline
          rows={3}
          placeholder="e.g. Abdomen soft, non-tender. Wound clean. Drain insitu."
        />
      </div>

      {/* Assessment */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="🧠" label="Assessment" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TemplateField
            label="Primary Diagnosis"
            value={diagnosis}
            onChange={setDiagnosis}
            category="assessment"
            placeholder="e.g. Post-Whipple Day 2 — improving"
          />
          <TemplateField
            label="Clinical Reasoning"
            value={reasoning}
            onChange={setReasoning}
            category="assessment"
            multiline
            rows={3}
            placeholder="e.g. Fever and raised CRP — continue antibiotics."
          />
        </div>
      </div>

      {/* Plan */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="📋" label="Plan" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {([
            { label: 'Investigations', color: COLORS.blue, bg: COLORS.blueBg, items: investigations, setItems: setInvestigations, category: 'investigations' as const, placeholder: 'e.g. FBC + CRP — press Enter to add' },
            { label: 'Medications ⚠️ unchecked by default', color: COLORS.red, bg: COLORS.redBg, items: medications, setItems: setMedications, category: 'medications' as const, placeholder: 'e.g. Inj. Pip-Tazo 4.5g IV Q8H' },
            { label: 'Nursing Instructions', color: COLORS.green, bg: COLORS.greenBg, items: nursing, setItems: setNursing, category: 'nursing' as const, placeholder: 'e.g. Hourly urine output' },
            { label: 'Follow-up', color: COLORS.amber, bg: COLORS.amberBg, items: followUp, setItems: setFollowUp, category: 'followUp' as const, placeholder: 'e.g. Review in 4 hours' },
          ] as const).map(({ label, color, bg, items, setItems, category, placeholder }) => (
            <div key={category}>
              <label style={{ fontSize: '12px', fontWeight: 600, color, display: 'block', marginBottom: '4px' }}>{label}</label>
              <PlanTagInput
                items={items as string[]}
                onChange={setItems as (items: string[]) => void}
                color={color}
                bg={bg}
                placeholder={placeholder}
                category={category}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          padding: '12px 24px', backgroundColor: canSubmit ? COLORS.brand : COLORS.bgMuted,
          color: canSubmit ? COLORS.surface : COLORS.textDim,
          border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
          cursor: canSubmit ? 'pointer' : 'default', alignSelf: 'flex-end',
          transition: 'background-color 0.15s',
        }}
      >
        Review Note →
      </button>
    </div>
  );
};

export default TemplateEntry;
