/**
 * Structured OPD initial assessment — new patient, first visit.
 * Produced by the scratchpad → Claude Vision pipeline.
 * Never stored as plain text. Every field is typed and queryable.
 */

import type { OPMedication } from './OPMedication';

export interface OPInitialAssessment {
  visitType: 'initial';
  visitDate: string; // ISO timestamp
  patientId: string;
  doctorId: string;
  specialty: 'general-medicine' | 'general-surgery' | 'other';

  chiefComplaint: string;

  history: {
    presentingIllness: string;
    relevantPastHistory: string;
    familyHistory: string | null;
    socialHistory: string | null;
    // SAFETY: allergies captured explicitly.
    // Claude flags conflicts with prescribed drugs.
    allergies: string[];
  };

  examination: {
    generalAppearance: string;
    vitals: {
      // SAFETY: All vitals are numbers or null. Never strings.
      temperature: number | null;
      heartRate: number | null;
      systolicBP: number | null;
      diastolicBP: number | null;
      spo2: number | null;
      respiratoryRate: number | null;
      weight: number | null;
      height: number | null;
    };
    systemicFindings: string[];
  };

  diagnosis: {
    primary: string;
    secondary: string[];
    icdCode: string | null;
  };

  prescription: {
    // SAFETY: No medication is auto-confirmed.
    // All medications are in draft state until the doctor signs.
    medications: OPMedication[];
  };

  investigations: {
    ordered: string[];
    urgency: 'routine' | 'urgent' | 'stat';
    instructions: string | null;
  };

  patientInstructions: string[];

  referral: {
    needed: boolean;
    specialty: string | null;
    urgency: 'routine' | 'urgent' | null;
    reason: string | null;
  };

  followUp: {
    interval: string;
    condition: string | null;
  };

  displayNote: {
    /** Complete human-readable note in Indian clinical documentation style */
    fullText: string;
  };
}

/**
 * A clinician-signed initial assessment. Immutable once signed.
 * @clinical-note Errors are formally amended, never deleted.
 */
export interface SignedOPInitialAssessment extends OPInitialAssessment {
  signedAt: string;
  signedBy: string;
  encounterId: string;
  manualCorrectionsCount: number;
  generationMethod: 'scratchpad + claude-vision';
}
