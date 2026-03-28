/**
 * Mock scratchpad service — returns realistic hardcoded clinical notes
 * after a simulated 2500ms delay (approximate Claude Vision latency).
 *
 * @dev Used when AI_PROVIDER = 'mock' or AI_API_KEY is empty.
 * Never commit real API calls in tests.
 */

import type { OPInitialAssessment } from '../../types/OPInitialAssessment';
import type { OPFollowUpAssessment } from '../../types/OPFollowUpAssessment';
import type { StructuredSOAPNote } from '../../types/clinical';
import type { ScratchpadService, ClinicalPatientContext } from './scratchpadService';

/** Simulated Claude Vision processing delay in milliseconds */
const MOCK_PROCESSING_DELAY_MS = 2500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// MOCK INITIAL ASSESSMENT — T2DM newly diagnosed
const MOCK_INITIAL: OPInitialAssessment = {
  visitType: 'initial',
  visitDate: new Date().toISOString(),
  patientId: 'mock-patient',
  doctorId: 'pending-signature',
  specialty: 'general-medicine',
  chiefComplaint: 'Increased thirst and frequent urination for 3 weeks',
  history: {
    presentingIllness: 'Patient presents with polyuria and polydipsia for 3 weeks duration. Also reports fatigue and mild weight loss (2kg) over the same period. No polyuria at night initially, now waking twice to urinate.',
    relevantPastHistory: 'No prior diagnosis of diabetes. Family h/o T2DM (father). HTN diagnosed 2 years ago, on Telma 40mg OD.',
    familyHistory: 'Father — T2DM. Mother — HTN.',
    socialHistory: 'Non-smoker. Occasional alcohol. Sedentary job.',
    allergies: [],
  },
  examination: {
    generalAppearance: 'Conscious, oriented, mild pallor, no icterus',
    vitals: {
      temperature: 36.8,
      heartRate: 84,
      systolicBP: 138,
      diastolicBP: 88,
      spo2: 98,
      respiratoryRate: 16,
      weight: 78,
      height: 168,
    },
    systemicFindings: [
      'CVS: S1S2 heard, no murmurs',
      'RS: NVBS, no added sounds',
      'P/A: Soft, non-tender, no organomegaly',
      'CNS: No focal deficits',
    ],
  },
  diagnosis: {
    primary: 'Type 2 Diabetes Mellitus — newly diagnosed',
    secondary: ['Essential Hypertension — on treatment'],
    icdCode: null,
  },
  prescription: {
    medications: [
      {
        id: 'med-001',
        drug: 'Glycomet 500mg',
        dose: '500mg',
        route: 'oral',
        frequency: 'BD',
        duration: '3 months',
        instructions: 'With food. Monitor for GI side effects.',
      },
      {
        id: 'med-002',
        drug: 'Telma 40mg',
        dose: '40mg',
        route: 'oral',
        frequency: 'OD',
        duration: 'Continue',
        instructions: 'Morning, before food',
      },
    ],
  },
  investigations: {
    ordered: ['FBS', 'PPBS', 'HbA1c', 'Lipid profile', 'Urine R/E', 'Serum creatinine', 'eGFR'],
    urgency: 'routine',
    instructions: 'All fasting investigations — patient to come after 10hr fast. Urine sample in the morning.',
  },
  patientInstructions: [
    'Diabetic diet — reduce sugar, refined carbs, fried foods',
    'Walk 30 minutes daily',
    'Monitor home blood sugar if glucometer available',
    'Return immediately if giddiness, excessive sweating, or confusion',
  ],
  referral: {
    needed: false,
    specialty: null,
    urgency: null,
    reason: null,
  },
  followUp: {
    interval: '6 weeks',
    condition: 'With HbA1c and fasting glucose report',
  },
  displayNote: {
    fullText: `OPD INITIAL ASSESSMENT

Chief Complaint: Increased thirst and frequent urination × 3 weeks

History of Presenting Illness:
Patient presents with polyuria and polydipsia for 3 weeks. Reports fatigue and weight loss of 2kg. Nocturia ×2. k/c/o HTN on Telma 40mg OD. Family h/o T2DM (father).

Examination:
Vitals: Wt 78kg, BP 138/88, HR 84, SpO2 98% RA, T 36.8°C
CVS/RS/Abd/CNS: NAD

Diagnosis: Type 2 Diabetes Mellitus — newly diagnosed (on background of Essential Hypertension)

Plan:
Rx: Glycomet 500mg BD PC × 3 months, Telma 40mg OD (continue)
Ix: FBS, PPBS, HbA1c, Lipid profile, Urine R/E, Creatinine, eGFR (routine/fasting)
Advice: Diabetic diet, 30min daily walk, home glucose monitoring
Follow up: 6 weeks with reports`,
  },
};

// MOCK FOLLOW-UP ASSESSMENT — Hypertension review
const MOCK_FOLLOWUP: OPFollowUpAssessment = {
  visitType: 'followup',
  visitDate: new Date().toISOString(),
  patientId: 'mock-patient',
  doctorId: 'pending-signature',
  specialty: 'general-medicine',
  intervalHistory: {
    complaint: 'Routine BP check. No new complaints.',
    progressSinceLastVisit: 'improved',
    newComplaints: [],
    medicationCompliance: 'compliant',
    sideEffects: [],
  },
  examination: {
    vitals: {
      temperature: null,
      heartRate: 76,
      systolicBP: 128,
      diastolicBP: 82,
      spo2: 99,
      respiratoryRate: null,
      weight: 75,
    },
    relevantFindings: ['BP well controlled on current medication', 'No ankle oedema'],
  },
  investigationResults: {
    reviewed: ['Serum creatinine 0.9 mg/dL — normal', 'Serum electrolytes — normal'],
    interpretation: 'Renal function stable. No electrolyte imbalance. Continue current medication.',
  },
  diagnosis: {
    primary: 'Essential Hypertension — controlled',
    secondary: [],
    progressNote: 'BP well controlled on Telma 40mg OD. No target organ damage on current labs.',
  },
  prescription: {
    medications: [
      {
        id: 'med-001',
        drug: 'Telma 40mg',
        dose: '40mg',
        route: 'oral',
        frequency: 'OD',
        duration: '1 month',
        instructions: 'Morning, before food',
      },
    ],
  },
  investigations: {
    ordered: [],
    urgency: 'routine',
    instructions: null,
  },
  patientInstructions: [
    'Continue low-salt diet',
    'Exercise 30 minutes daily',
    'Home BP monitoring — record readings',
  ],
  referral: {
    needed: false,
    specialty: null,
    urgency: null,
    reason: null,
  },
  followUp: {
    interval: '1 month',
    condition: 'Routine BP check',
  },
  displayNote: {
    fullText: `OPD FOLLOW UP

Complaint: Routine BP check. Compliant with medication. No new complaints.

Examination: BP 128/82, HR 76, Wt 75kg, SpO2 99%
No ankle oedema.

Investigation review: Creatinine 0.9 (normal), Electrolytes normal

Assessment: Essential Hypertension — controlled on Telma 40mg OD

Plan: Continue Telma 40mg OD × 1 month
Advice: Low-salt diet, daily exercise, home BP monitoring
F/U: 1 month`,
  },
};

// MOCK SOAP NOTE — Post-appendicectomy Day 2
const MOCK_SOAP: StructuredSOAPNote = {
  subjective: {
    chiefComplaint: 'Post-appendicectomy Day 2, pain reducing',
    symptoms: ['Mild incision site pain', 'Tolerating sips of clear fluids'],
    painScore: 3,
    patientStatement: 'Pain is much better than yesterday. I can drink water now.',
  },
  objective: {
    temperature: 37.1,
    heartRate: 82,
    systolicBP: 118,
    diastolicBP: 76,
    spo2: 98,
    respiratoryRate: 16,
    findings: [
      'Afebrile',
      'Haemodynamically stable',
      'Wound: clean, dry, no signs of infection',
      'Abdomen: soft, mild tenderness at surgical site',
      'Bowel sounds present',
    ],
  },
  assessment: {
    primaryDiagnosis: 'Post-appendicectomy Day 2 — recovering well',
    activeProblemsSummary: 'Laparoscopic appendicectomy yesterday for acute appendicitis. Good post-op recovery.',
    clinicalReasoning: 'Clinical parameters stable. Tolerating oral fluids. Plan to step up diet and remove IV access today. Discharge planning for Day 3 if progress maintained.',
  },
  plan: {
    investigations: [],
    medications: [
      'Tab. Paracetamol 500mg oral TDS × 3 days',
      'Tab. Metrogyl 400mg oral TDS × 5 days',
    ],
    nursing: [
      'Step up to soft diet — start with khichdi/soup',
      'Remove IV cannula',
      'Ambulate with physiotherapist',
      'Wound dressing tomorrow',
    ],
    followUp: [
      'Discharge Day 3 if vitals stable and tolerating food',
      'OPD review 1 week post-discharge for wound check',
    ],
    allPlanItems: [
      'Tab. Paracetamol 500mg oral TDS × 3 days',
      'Tab. Metrogyl 400mg oral TDS × 5 days',
      'Step up to soft diet',
      'Remove IV cannula',
      'Discharge Day 3 if stable',
      'OPD review 1 week post-discharge',
    ],
  },
  displayNote: {
    subjective: 'Post-appendicectomy Day 2. Pain reducing (score 3/10). Tolerating sips of clear fluids.',
    objective: 'Afebrile T37.1. HR 82, BP 118/76, SpO2 98% RA. Wound clean, abdomen soft.',
    assessment: 'Post-appendicectomy Day 2 — recovering well. Haemodynamically stable.',
    plan: 'Step up diet. Remove IV access. Paracetamol + Metrogyl orally. Discharge Day 3 if stable. OPD follow up 1 week.',
  },
};

export class MockScratchpadService implements ScratchpadService {
  /**
   * Returns a realistic mock note after simulated processing delay.
   * @clinical-note All mock data is synthetic — for development and testing only.
   */
  async processScribble(
    _imageDataUrl: string,
    noteType: 'initial' | 'followup' | 'soap',
    patientContext: ClinicalPatientContext
  ): Promise<OPInitialAssessment | OPFollowUpAssessment | StructuredSOAPNote> {
    await delay(MOCK_PROCESSING_DELAY_MS);
    switch (noteType) {
      case 'initial':
        return { ...MOCK_INITIAL, patientId: patientContext.patientId };
      case 'followup':
        return { ...MOCK_FOLLOWUP, patientId: patientContext.patientId };
      case 'soap':
        return { ...MOCK_SOAP };
    }
  }
}
