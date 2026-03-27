import React, { useState, useRef } from 'react';
import { COLORS } from '../../constants/colors';
import PlanTagInput from './PlanTagInput';
import TemplateField from './TemplateField';
import { assembleQuickPlanNote } from '../../utils/assembleSOAPNote';
import type { PlanFields } from '../../utils/assembleSOAPNote';
import type { StructuredSOAPNote } from '../../types/clinical';

/**
 * Quick Plan entry mode — fastest typed note path.
 * Doctor enters assessment + plan items only. No full SOAP required.
 * Each field shows inline clinical suggestions when focused.
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
  const planInputRefs = useRef<Record<PlanField, React.RefObject<HTMLInputElement | null>>>({
    investigations: React.createRef<HTMLInputElement>(),
    medications: React.createRef<HTMLInputElement>(),
    nursing: React.createRef<HTMLInputElement>(),
    followUp: React.createRef<HTMLInputElement>(),
  });

  const handleSubmit = () => {
    onSubmit(assembleQuickPlanNote(assessment, plan));
  };

  const canSubmit = assessment.trim() || Object.values(plan).some(arr => arr.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Assessment — inline suggestions for clinical assessment terms */}
      <TemplateField
        label="🧠 Assessment / Primary Diagnosis"
        value={assessment}
        onChange={setAssessment}
        category="assessment"
        multiline
        rows={3}
        placeholder="e.g. Post-Whipple Day 2 — improving. Query anastomotic leak resolving."
        color={COLORS.brand}
        bg={COLORS.card}
      />

      {/* Plan sections — each has inline suggestions via PlanTagInput */}
      {PLAN_SECTIONS.map(sec => (
        <div key={sec.key}>
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
            category={sec.key}
            inputRef={planInputRefs.current[sec.key]}
          />
        </div>
      ))}

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
