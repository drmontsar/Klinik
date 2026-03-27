import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import ClinicalKeyboard from '../shared/ClinicalKeyboard';
import PlanTagInput from './PlanTagInput';
import { assembleQuickPlanNote } from '../../utils/assembleSOAPNote';
import type { PlanFields } from '../../utils/assembleSOAPNote';
import type { StructuredSOAPNote } from '../../types/clinical';

/**
 * Quick Plan entry mode — fastest typed note path.
 * Doctor enters assessment + plan items only. No full SOAP required.
 * Delegates note assembly to assembleQuickPlanNote utility.
 * @param onSubmit - Called with assembled SOAP note when ready to review
 */
interface QuickPlanEntryProps {
  onSubmit: (note: StructuredSOAPNote) => void;
}

type PlanField = keyof PlanFields;

const PLAN_SECTIONS: { key: PlanField; label: string; color: string; bg: string; placeholder: string }[] = [
  { key: 'investigations', label: 'Investigations', color: COLORS.blue, bg: COLORS.blueBg, placeholder: 'e.g. FBC + CRP, CT Abdomen' },
  { key: 'medications', label: 'Medications', color: COLORS.red, bg: COLORS.redBg, placeholder: 'e.g. Inj. Pip-Tazo 4.5g IV Q8H' },
  { key: 'nursing', label: 'Nursing', color: COLORS.green, bg: COLORS.greenBg, placeholder: 'e.g. Hourly urine output monitoring' },
  { key: 'followUp', label: 'Follow-up', color: COLORS.amber, bg: COLORS.amberBg, placeholder: 'e.g. Review in 4 hours' },
];

const QuickPlanEntry: React.FC<QuickPlanEntryProps> = ({ onSubmit }) => {
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState<PlanFields>({
    investigations: [], medications: [], nursing: [], followUp: [],
  });
  const [activePlanField, setActivePlanField] = useState<PlanField>('investigations');
  const assessmentRef = useRef<HTMLTextAreaElement>(null);
  const planInputRefs = useRef<Record<PlanField, React.RefObject<HTMLInputElement | null>>>({
    investigations: React.createRef<HTMLInputElement>(),
    medications: React.createRef<HTMLInputElement>(),
    nursing: React.createRef<HTMLInputElement>(),
    followUp: React.createRef<HTMLInputElement>(),
  });

  // CLINICAL: Insert keyboard term at cursor in whichever field is active
  const handleInsert = (text: string) => {
    const el = assessmentRef.current;
    if (el && document.activeElement === el) {
      const start = el.selectionStart ?? assessment.length;
      setAssessment(assessment.slice(0, start) + text + assessment.slice(start));
      setTimeout(() => el.setSelectionRange(start + text.length, start + text.length), 0);
    } else {
      const inputEl = planInputRefs.current[activePlanField].current;
      if (inputEl) {
        inputEl.focus();
        const pos = inputEl.selectionStart ?? inputEl.value.length;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        setter?.call(inputEl, inputEl.value.slice(0, pos) + text + inputEl.value.slice(pos));
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const handleSubmit = () => {
    onSubmit(assembleQuickPlanNote(assessment, plan));
  };

  const canSubmit = assessment.trim() || Object.values(plan).some(arr => arr.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Assessment */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: 600, color: COLORS.textSecondary, display: 'block', marginBottom: '6px' }}>
          🧠 Assessment / Primary Diagnosis
        </label>
        <textarea
          ref={assessmentRef}
          value={assessment}
          onChange={e => setAssessment(e.target.value)}
          onFocus={() => setActivePlanField('investigations')}
          placeholder="e.g. Post-Whipple Day 2 — improving. Query anastomotic leak resolving."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '10px', fontSize: '14px', lineHeight: '1.6', color: COLORS.text,
            fontFamily: 'inherit', resize: 'vertical', backgroundColor: COLORS.surface,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Plan sections */}
      {PLAN_SECTIONS.map(sec => (
        <div key={sec.key} onClick={() => setActivePlanField(sec.key)}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: sec.color, display: 'block', marginBottom: '6px' }}>
            {sec.label}
            <span style={{ fontWeight: 400, color: COLORS.textDim, marginLeft: '6px' }}>— press Enter to add</span>
            {sec.key === 'medications' && (
              <span style={{ marginLeft: '8px', fontSize: '11px', color: COLORS.red }}>⚠️ Unchecked by default in review</span>
            )}
          </label>
          <PlanTagInput
            items={plan[sec.key]}
            onChange={items => setPlan(p => ({ ...p, [sec.key]: items }))}
            color={sec.color}
            bg={sec.bg}
            placeholder={sec.placeholder}
            inputRef={planInputRefs.current[sec.key]}
          />
        </div>
      ))}

      <ClinicalKeyboard onInsert={handleInsert} />

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          padding: '12px 24px',
          backgroundColor: canSubmit ? COLORS.brand : COLORS.bgMuted,
          color: canSubmit ? COLORS.surface : COLORS.textDim,
          border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
          cursor: canSubmit ? 'pointer' : 'default', alignSelf: 'flex-end',
          transition: 'background-color 0.15s',
        }}
      >
        Review Plan →
      </button>
    </div>
  );
};

export default QuickPlanEntry;
