import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import ClinicalKeyboard from '../shared/ClinicalKeyboard';
import SectionHeader from './SectionHeader';
import { assembleTemplateNote } from '../../utils/assembleSOAPNote';
import type { StructuredSOAPNote } from '../../types/clinical';

/**
 * Standard Template entry mode — full SOAP form.
 * Doctor fills each SOAP section including vitals as numeric inputs.
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

const areaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: '1.6', minHeight: '80px',
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
  // Plan
  const [investigations, setInvestigations] = useState('');
  const [medications, setMedications] = useState('');
  const [nursing, setNursing] = useState('');
  const [followUp, setFollowUp] = useState('');

  // Track active field for ClinicalKeyboard insertion
  const activeRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [activeField, setActiveField] = useState<string>('chiefComplaint');

  const setterMap: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
    chiefComplaint: setChiefComplaint, symptoms: setSymptoms, findings: setFindings,
    diagnosis: setDiagnosis, reasoning: setReasoning, investigations: setInvestigations,
    medications: setMedications, nursing: setNursing, followUp: setFollowUp,
  };

  // CLINICAL: Insert keyboard term at cursor position in the focused field
  const handleInsert = (text: string) => {
    const setter = setterMap[activeField];
    if (!setter) return;
    const el = activeRef.current;
    if (el && 'selectionStart' in el) {
      const start = el.selectionStart ?? 0;
      const next = el.value.slice(0, start) + text + el.value.slice(start);
      setter(next);
      setTimeout(() => (el as HTMLInputElement).setSelectionRange(start + text.length, start + text.length), 0);
    } else {
      setter(prev => prev + text);
    }
  };

  const refs = {
    chiefComplaint: useRef<HTMLInputElement>(null),
    symptoms: useRef<HTMLTextAreaElement>(null),
    findings: useRef<HTMLTextAreaElement>(null),
    diagnosis: useRef<HTMLInputElement>(null),
    reasoning: useRef<HTMLTextAreaElement>(null),
    investigations: useRef<HTMLTextAreaElement>(null),
    medications: useRef<HTMLTextAreaElement>(null),
    nursing: useRef<HTMLTextAreaElement>(null),
    followUp: useRef<HTMLTextAreaElement>(null),
  };

  const fp = (fieldName: string, ref: React.RefObject<any>) => ({
    ref, onFocus: () => { setActiveField(fieldName); activeRef.current = ref.current; },
  });

  const handleSubmit = () => {
    onSubmit(assembleTemplateNote({
      chiefComplaint, symptoms, painScore,
      temp, hr, sbp, dbp, spo2, rr, findings,
      diagnosis, reasoning,
      investigations, medications, nursing, followUp,
    }));
  };

  const canSubmit = diagnosis.trim() || chiefComplaint.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Subjective */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="🗣️" label="Subjective" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>Chief Complaint</label>
            <input value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="e.g. Pain at surgical site, nausea" style={inputStyle} {...fp('chiefComplaint', refs.chiefComplaint)} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>Symptoms (comma-separated)</label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Pain, Nausea, Fever, Rigors" rows={2} style={areaStyle} {...fp('symptoms', refs.symptoms)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, whiteSpace: 'nowrap' }}>Pain Score (0–10)</label>
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
        <div>
          <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>Examination Findings</label>
          <textarea value={findings} onChange={e => setFindings(e.target.value)} placeholder="e.g. Abdomen soft, non-tender. Wound clean. Drain insitu." rows={3} style={areaStyle} {...fp('findings', refs.findings)} />
        </div>
      </div>

      {/* Assessment */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="🧠" label="Assessment" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>Primary Diagnosis</label>
            <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Post-Whipple Day 2 — improving" style={inputStyle} {...fp('diagnosis', refs.diagnosis)} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px' }}>Clinical Reasoning</label>
            <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="e.g. Fever and raised CRP — continue antibiotics. Drain output reducing — suggests leak resolving." rows={3} style={areaStyle} {...fp('reasoning', refs.reasoning)} />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: '12px', padding: '16px' }}>
        <SectionHeader icon="📋" label="Plan" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Investigations', color: COLORS.blue, val: investigations, set: setInvestigations, ref: refs.investigations, field: 'investigations', placeholder: 'One per line:\nFBC + CRP\nCT Abdomen' },
            { label: 'Medications ⚠️ unchecked by default', color: COLORS.red, val: medications, set: setMedications, ref: refs.medications, field: 'medications', placeholder: 'One per line:\nInj. Pip-Tazo 4.5g IV Q8H' },
            { label: 'Nursing Instructions', color: COLORS.green, val: nursing, set: setNursing, ref: refs.nursing, field: 'nursing', placeholder: 'One per line:\nHourly urine output\nWound review' },
            { label: 'Follow-up', color: COLORS.amber, val: followUp, set: setFollowUp, ref: refs.followUp, field: 'followUp', placeholder: 'One per line:\nReview in 4 hours' },
          ].map(({ label, color, val, set, ref, field, placeholder }) => (
            <div key={field}>
              <label style={{ fontSize: '12px', fontWeight: 600, color, display: 'block', marginBottom: '4px' }}>{label}</label>
              <textarea value={val} onChange={e => set(e.target.value)} placeholder={placeholder} rows={3} style={areaStyle} {...fp(field, ref)} />
            </div>
          ))}
        </div>
      </div>

      <ClinicalKeyboard onInsert={handleInsert} />

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
