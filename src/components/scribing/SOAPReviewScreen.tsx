import React, { useState } from 'react';
import type { StructuredSOAPNote } from '../../types/clinical';
import { COLORS } from '../../constants/colors';

/**
 * Structured SOAP review screen.
 * Shows extracted vitals, categorised plan items for confirmation, and editable display note.
 * @clinical-note Doctor MUST review and explicitly confirm each plan section before signing.
 * Medications are ALWAYS unchecked by default — safety rule, never change this.
 */
interface SOAPReviewProps {
  soapNote: StructuredSOAPNote | null;
  providerName: string;
  consultationDurationSeconds: number;
  onUpdateDisplayNote: (
    section: keyof StructuredSOAPNote['displayNote'],
    content: string
  ) => void;
  onApprove: (confirmedItems: ConfirmedPlanItems) => void;
  onReject: () => void;
  isGenerating: boolean;
  generateError: string | null;
}

export interface ConfirmedPlanItems {
  investigations: string[];
  medications: string[];
  nursing: string[];
  followUp: string[];
}

// SAFETY: Minimum consultation duration before we flag the note as potentially incomplete
const SHORT_CONSULTATION_THRESHOLD_SECONDS = 60;

const SOAPReviewScreen: React.FC<SOAPReviewProps> = ({
  soapNote,
  providerName,
  consultationDurationSeconds,
  onUpdateDisplayNote,
  onApprove,
  onReject,
  isGenerating,
  generateError,
}) => {
  const [editingSection, setEditingSection] = useState<
    keyof StructuredSOAPNote['displayNote'] | null
  >(null);

  // SAFETY: Medications are unchecked by default. Investigations, nursing, followUp are checked.
  const initChecked = (items: string[], defaultChecked: boolean): Record<number, boolean> =>
    Object.fromEntries(items.map((_, i) => [i, defaultChecked]));

  const [investigationChecks, setInvestigationChecks] = useState<Record<number, boolean>>({});
  const [medicationChecks, setMedicationChecks] = useState<Record<number, boolean>>({});
  const [nursingChecks, setNursingChecks] = useState<Record<number, boolean>>({});
  const [followUpChecks, setFollowUpChecks] = useState<Record<number, boolean>>({});
  const [checksInitialised, setChecksInitialised] = useState(false);

  // Initialise check states when soapNote arrives
  if (soapNote && !checksInitialised) {
    setInvestigationChecks(initChecked(soapNote.plan.investigations, true));
    // SAFETY: Medications are NEVER auto-confirmed. Always unchecked by default.
    setMedicationChecks(initChecked(soapNote.plan.medications, false));
    setNursingChecks(initChecked(soapNote.plan.nursing, true));
    setFollowUpChecks(initChecked(soapNote.plan.followUp, true));
    setChecksInitialised(true);
  }

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
    idx: number
  ) => setter(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleApprove = () => {
    if (!soapNote) return;
    const confirmedItems: ConfirmedPlanItems = {
      investigations: soapNote.plan.investigations.filter((_, i) => investigationChecks[i]),
      medications: soapNote.plan.medications.filter((_, i) => medicationChecks[i]),
      nursing: soapNote.plan.nursing.filter((_, i) => nursingChecks[i]),
      followUp: soapNote.plan.followUp.filter((_, i) => followUpChecks[i]),
    };
    onApprove(confirmedItems);
  };

  const isShortConsultation =
    consultationDurationSeconds > 0 &&
    consultationDurationSeconds < SHORT_CONSULTATION_THRESHOLD_SECONDS;

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isGenerating) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧠</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.text, marginBottom: '6px' }}>
          Generating SOAP Note...
        </div>
        <div style={{ fontSize: '13px', color: COLORS.textMuted, marginBottom: '24px' }}>
          {providerName}
        </div>
        <div
          style={{
            width: '240px',
            height: '4px',
            backgroundColor: COLORS.borderLight,
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: COLORS.brand,
              borderRadius: '2px',
              animation: 'klinik-progress 1.6s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes klinik-progress {
            0%   { width: 15%; margin-left: 0; }
            50%  { width: 60%; margin-left: 20%; }
            100% { width: 15%; margin-left: 85%; }
          }
        `}</style>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (generateError) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: COLORS.redBg,
          borderRadius: '12px',
          border: `1px solid ${COLORS.redBorder}`,
        }}
      >
        <div
          style={{ fontSize: '15px', fontWeight: 600, color: COLORS.red, marginBottom: '8px' }}
        >
          ⚠️ SOAP Generation Failed
        </div>
        <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '16px' }}>
          {generateError}
        </div>
        <button
          onClick={onReject}
          style={{
            padding: '8px 16px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '8px',
            cursor: 'pointer',
            color: COLORS.text,
            fontSize: '14px',
          }}
        >
          ← Back to Recording
        </button>
      </div>
    );
  }

  if (!soapNote) return null;

  // ── Main review UI ─────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: COLORS.text }}>
            Review SOAP Note
          </h3>
          <div style={{ fontSize: '13px', color: COLORS.textMuted }}>
            Review each section. Confirm plan items. Tap Sign &amp; Save when ready.
          </div>
        </div>
        <span
          style={{
            fontSize: '12px',
            color: COLORS.purple,
            backgroundColor: COLORS.purpleBg,
            padding: '4px 10px',
            borderRadius: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          AI: {providerName}
        </span>
      </div>

      {/* Short consultation warning */}
      {isShortConsultation && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: COLORS.amberBg,
            borderRadius: '10px',
            border: `1px solid ${COLORS.amberBorder}`,
            fontSize: '13px',
            color: COLORS.amber,
            fontWeight: 500,
          }}
        >
          ⚠️ Short consultation ({consultationDurationSeconds}s) — verify this note is complete
          before signing.
        </div>
      )}

      {/* Extracted Vitals */}
      <VitalsCard vitals={soapNote.objective} />

      {/* SOAP Display Note — editable sections */}
      {(
        [
          { key: 'subjective' as const, label: 'Subjective', icon: '🗣️' },
          { key: 'objective' as const, label: 'Objective', icon: '🔬' },
          { key: 'assessment' as const, label: 'Assessment', icon: '🧠' },
        ] as const
      ).map(({ key, label, icon }) => (
        <NoteSection
          key={key}
          label={label}
          icon={icon}
          content={soapNote.displayNote[key]}
          isEditing={editingSection === key}
          onEdit={() => setEditingSection(editingSection === key ? null : key)}
          onChange={v => onUpdateDisplayNote(key, v)}
        />
      ))}

      {/* Plan Confirmation */}
      <div
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${COLORS.borderLight}`,
            fontSize: '15px',
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          📋 Confirm Plan
        </div>

        {/* Investigations */}
        <PlanSection
          title="Investigations"
          color={COLORS.blue}
          bgColor={COLORS.blueBg}
          items={soapNote.plan.investigations}
          checks={investigationChecks}
          onToggle={idx => toggle(setInvestigationChecks, idx)}
          emptyText="No investigations ordered"
        />

        {/* Medications — SAFETY: unchecked by default */}
        <PlanSection
          title="Medications"
          color={COLORS.red}
          bgColor={COLORS.redBg}
          items={soapNote.plan.medications}
          checks={medicationChecks}
          onToggle={idx => toggle(setMedicationChecks, idx)}
          emptyText="No medication changes"
          safetyNote="Medications are unchecked by default — review each one carefully"
        />

        {/* Nursing */}
        <PlanSection
          title="Nursing Instructions"
          color={COLORS.green}
          bgColor={COLORS.greenBg}
          items={soapNote.plan.nursing}
          checks={nursingChecks}
          onToggle={idx => toggle(setNursingChecks, idx)}
          emptyText="No nursing instructions"
        />

        {/* Follow-up */}
        <PlanSection
          title="Follow-up"
          color={COLORS.amber}
          bgColor={COLORS.amberBg}
          items={soapNote.plan.followUp}
          checks={followUpChecks}
          onToggle={idx => toggle(setFollowUpChecks, idx)}
          emptyText="No follow-up items"
          isLast
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '4px',
        }}
      >
        <button
          onClick={onReject}
          style={{
            padding: '12px 24px',
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: '12px',
            cursor: 'pointer',
            color: COLORS.textMuted,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ✕ Discard &amp; Re-record
        </button>
        <button
          onClick={handleApprove}
          style={{
            padding: '12px 32px',
            backgroundColor: COLORS.green,
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(22,163,74,0.3)',
          }}
        >
          ✓ Sign &amp; Save Note
        </button>
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface VitalsCardProps {
  vitals: StructuredSOAPNote['objective'];
}

const VitalsCard: React.FC<VitalsCardProps> = ({ vitals }) => {
  const params = [
    { label: 'Temp', value: vitals.temperature, unit: '°C', flag: vitals.temperature !== null && (vitals.temperature < 36.1 || vitals.temperature > 38.0) },
    { label: 'HR', value: vitals.heartRate, unit: 'bpm', flag: vitals.heartRate !== null && (vitals.heartRate < 51 || vitals.heartRate > 110) },
    { label: 'BP', value: vitals.systolicBP !== null && vitals.diastolicBP !== null ? `${vitals.systolicBP}/${vitals.diastolicBP}` : null, unit: 'mmHg', flag: vitals.systolicBP !== null && vitals.systolicBP < 111 },
    { label: 'SpO₂', value: vitals.spo2, unit: '%', flag: vitals.spo2 !== null && vitals.spo2 < 96 },
    { label: 'RR', value: vitals.respiratoryRate, unit: '/min', flag: vitals.respiratoryRate !== null && (vitals.respiratoryRate < 12 || vitals.respiratoryRate > 20) },
  ] as const;

  const hasVitals = vitals.temperature !== null || vitals.heartRate !== null || vitals.systolicBP !== null;
  if (!hasVitals) return null;

  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.borderLight}`,
        borderRadius: '12px',
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: COLORS.textMuted,
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Extracted Vitals
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {params.map(({ label, value, unit, flag }) =>
          value !== null ? (
            <div
              key={label}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: flag ? COLORS.amberBg : COLORS.bgSubtle,
                border: `1px solid ${flag ? COLORS.amberBorder : COLORS.borderLight}`,
              }}
            >
              <span style={{ fontSize: '11px', color: COLORS.textMuted, marginRight: '4px' }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: flag ? COLORS.amber : COLORS.text,
                }}
              >
                {value}
              </span>
              <span style={{ fontSize: '11px', color: COLORS.textDim, marginLeft: '2px' }}>
                {unit}
              </span>
            </div>
          ) : null
        )}
      </div>
      {vitals.findings.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          {vitals.findings.map((f, i) => (
            <div
              key={i}
              style={{
                fontSize: '13px',
                color: COLORS.textSecondary,
                paddingLeft: '12px',
                borderLeft: `2px solid ${COLORS.borderLight}`,
                marginBottom: '4px',
              }}
            >
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteSectionProps {
  label: string;
  icon: string;
  content: string;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
}

const NoteSection: React.FC<NoteSectionProps> = ({
  label,
  icon,
  content,
  isEditing,
  onEdit,
  onChange,
}) => (
  <div
    style={{
      padding: '16px',
      backgroundColor: COLORS.surface,
      borderRadius: '12px',
      border: `1px solid ${isEditing ? COLORS.brand : COLORS.borderLight}`,
      transition: 'border-color 0.15s',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '15px', color: COLORS.text }}>
        {icon} {label}
      </span>
      <button
        onClick={onEdit}
        style={{
          fontSize: '12px',
          color: COLORS.brand,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {isEditing ? '✓ Done' : '✎ Edit'}
      </button>
    </div>
    {isEditing ? (
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: '90px',
          padding: '10px 12px',
          border: `1px solid ${COLORS.brandBorder}`,
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: COLORS.text,
          fontFamily: 'inherit',
          resize: 'vertical',
          backgroundColor: COLORS.brandSubtle,
          boxSizing: 'border-box',
        }}
      />
    ) : (
      <div
        onClick={onEdit}
        style={{
          fontSize: '14px',
          lineHeight: '1.7',
          color: COLORS.textSecondary,
          whiteSpace: 'pre-wrap',
          cursor: 'pointer',
        }}
      >
        {content || <span style={{ color: COLORS.textDim, fontStyle: 'italic' }}>Empty — tap to add</span>}
      </div>
    )}
  </div>
);

interface PlanSectionProps {
  title: string;
  color: string;
  bgColor: string;
  items: string[];
  checks: Record<number, boolean>;
  onToggle: (idx: number) => void;
  emptyText: string;
  safetyNote?: string;
  isLast?: boolean;
}

const PlanSection: React.FC<PlanSectionProps> = ({
  title,
  color,
  bgColor,
  items,
  checks,
  onToggle,
  emptyText,
  safetyNote,
  isLast,
}) => {
  const confirmedCount = items.filter((_, i) => checks[i]).length;

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${COLORS.borderLight}`,
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: COLORS.bgSubtle,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color }}>
          {title}
        </span>
        {items.length > 0 && (
          <span
            style={{
              fontSize: '12px',
              color,
              backgroundColor: bgColor,
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            {confirmedCount}/{items.length} confirmed
          </span>
        )}
      </div>
      {safetyNote && (
        <div
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            color: COLORS.red,
            backgroundColor: COLORS.redBg,
            fontWeight: 500,
          }}
        >
          ⚠️ {safetyNote}
        </div>
      )}
      <div style={{ padding: '8px 16px' }}>
        {items.length === 0 ? (
          <div style={{ fontSize: '13px', color: COLORS.textDim, fontStyle: 'italic', padding: '4px 0' }}>
            {emptyText}
          </div>
        ) : (
          items.map((item, idx) => (
            <label
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 0',
                cursor: 'pointer',
                borderBottom:
                  idx < items.length - 1 ? `1px solid ${COLORS.borderLight}` : 'none',
              }}
            >
              <input
                type="checkbox"
                checked={!!checks[idx]}
                onChange={() => onToggle(idx)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '1px',
                  accentColor: color,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: checks[idx] ? COLORS.text : COLORS.textMuted,
                  textDecoration: checks[idx] ? 'none' : 'none',
                }}
              >
                {item}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default SOAPReviewScreen;
