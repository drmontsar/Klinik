import type { StructuredSOAPNote } from '../types/clinical';

/**
 * Pure functions for assembling StructuredSOAPNote from typed user inputs.
 * No state, no side effects — takes raw form data, returns a typed note.
 * Used by QuickPlanEntry and TemplateEntry before routing to SOAPReviewScreen.
 * @clinical-note Output always goes to SOAPReviewScreen for doctor confirmation.
 */

export type PlanFields = {
  investigations: string[];
  medications: string[];
  nursing: string[];
  followUp: string[];
};

export interface TemplateInputs {
  // Subjective
  chiefComplaint: string;
  symptoms: string;       // comma-separated string from form
  painScore: string;      // numeric string from input, may be empty
  // Objective
  temp: string;
  hr: string;
  sbp: string;
  dbp: string;
  spo2: string;
  rr: string;
  findings: string;       // newline-separated string from textarea
  // Assessment
  diagnosis: string;
  reasoning: string;
  // Plan — newline-separated strings from textareas
  investigations: string;
  medications: string;
  nursing: string;
  followUp: string;
}

/**
 * Parses a string vital sign value to number or null.
 * @param val - Raw string from a numeric input field
 * @returns Parsed number, or null if empty or non-numeric
 * @clinical-note SAFETY: Vital signs are always numbers or null in the final note.
 * This prevents string values from entering the clinical data model.
 */
export const parseVital = (val: string): number | null => {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

/**
 * Assembles a StructuredSOAPNote from Quick Plan entry inputs.
 * Subjective and objective are left empty — Quick Plan captures
 * assessment and plan only. The fastest typed note path.
 * @param assessment - Free-text assessment / primary diagnosis
 * @param plan - Plan items by category
 * @returns A StructuredSOAPNote ready for SOAPReviewScreen
 * @clinical-note Partial note — doctor reviews completeness before signing.
 */
export const assembleQuickPlanNote = (
  assessment: string,
  plan: PlanFields
): StructuredSOAPNote => {
  const allPlanItems = [
    ...plan.investigations,
    ...plan.medications,
    ...plan.nursing,
    ...plan.followUp,
  ];

  return {
    subjective: { chiefComplaint: '', symptoms: [], painScore: null, patientStatement: '' },
    objective: {
      temperature: null, heartRate: null, systolicBP: null,
      diastolicBP: null, spo2: null, respiratoryRate: null, findings: [],
    },
    assessment: {
      primaryDiagnosis: assessment,
      activeProblemsSummary: assessment,
      clinicalReasoning: '',
    },
    plan: {
      investigations: plan.investigations,
      medications: plan.medications,
      nursing: plan.nursing,
      followUp: plan.followUp,
      allPlanItems,
    },
    displayNote: {
      subjective: '',
      objective: '',
      assessment,
      plan: allPlanItems.map(i => `• ${i}`).join('\n'),
    },
  };
};

/**
 * Assembles a StructuredSOAPNote from Full Template entry inputs.
 * All four SOAP sections populated. Vitals parsed as numbers.
 * @param inputs - Raw string values from all template form fields
 * @returns A StructuredSOAPNote ready for SOAPReviewScreen
 * @clinical-note SAFETY: All vitals run through parseVital — stored as numbers or null.
 */
export const assembleTemplateNote = (inputs: TemplateInputs): StructuredSOAPNote => {
  const splitLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);

  const investigationList = splitLines(inputs.investigations);
  const medicationList = splitLines(inputs.medications);
  const nursingList = splitLines(inputs.nursing);
  const followUpList = splitLines(inputs.followUp);
  const allPlanItems = [...investigationList, ...medicationList, ...nursingList, ...followUpList];

  return {
    subjective: {
      chiefComplaint: inputs.chiefComplaint,
      symptoms: inputs.symptoms.split(',').map(s => s.trim()).filter(Boolean),
      painScore: parseVital(inputs.painScore),
      patientStatement: inputs.chiefComplaint,
    },
    objective: {
      temperature: parseVital(inputs.temp),
      heartRate: parseVital(inputs.hr),
      systolicBP: parseVital(inputs.sbp),
      diastolicBP: parseVital(inputs.dbp),
      spo2: parseVital(inputs.spo2),
      respiratoryRate: parseVital(inputs.rr),
      findings: inputs.findings.split('\n').map(s => s.trim()).filter(Boolean),
    },
    assessment: {
      primaryDiagnosis: inputs.diagnosis,
      activeProblemsSummary: inputs.diagnosis,
      clinicalReasoning: inputs.reasoning,
    },
    plan: {
      investigations: investigationList,
      medications: medicationList,
      nursing: nursingList,
      followUp: followUpList,
      allPlanItems,
    },
    displayNote: {
      subjective: [
        inputs.chiefComplaint,
        inputs.symptoms ? `Symptoms: ${inputs.symptoms}` : '',
        inputs.painScore ? `Pain score: ${inputs.painScore}/10` : '',
      ].filter(Boolean).join('. '),
      objective: [
        inputs.temp && `Temp ${inputs.temp}°C`,
        inputs.hr && `HR ${inputs.hr}`,
        inputs.sbp && `BP ${inputs.sbp}/${inputs.dbp}`,
        inputs.spo2 && `SpO₂ ${inputs.spo2}%`,
        inputs.rr && `RR ${inputs.rr}`,
        inputs.findings,
      ].filter(Boolean).join('. '),
      assessment: [inputs.diagnosis, inputs.reasoning].filter(Boolean).join('. '),
      plan: allPlanItems.map(i => `• ${i}`).join('\n'),
    },
  };
};
