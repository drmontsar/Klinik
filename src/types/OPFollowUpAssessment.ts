/**
 * Structured OPD follow-up assessment — returning patient.
 * Produced by the scratchpad → Claude Vision pipeline.
 * Never stored as plain text. Every field is typed and queryable.
 */

import type { OPMedication } from './OPMedication';

export interface OPFollowUpAssessment {
  visitType: 'followup';
  visitDate: string; // ISO timestamp
  patientId: string;
  doctorId: string;
  specialty: 'general-medicine' | 'general-surgery' | 'other';

  intervalHistory: {
    complaint: string;
    progressSinceLastVisit: 'improved' | 'same' | 'worse';
    newComplaints: string[];
    medicationCompliance: 'compliant' | 'partial' | 'non-compliant' | null;
    sideEffects: string[];
  };

  examination: {
    vitals: {
      // SAFETY: All vitals are numbers or null. Never strings.
      temperature: number | null;
      heartRate: number | null;
      systolicBP: number | null;
      diastolicBP: number | null;
      spo2: number | null;
      respiratoryRate: number | null;
      weight: number | null;
    };
    relevantFindings: string[];
  };

  investigationResults: {
    reviewed: string[];
    interpretation: string | null;
  };

  diagnosis: {
    primary: string;
    secondary: string[];
    progressNote: string; // one sentence clinical status
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
 * A clinician-signed follow-up assessment. Immutable once signed.
 * @clinical-note Errors are formally amended, never deleted.
 */
export interface SignedOPFollowUpAssessment extends OPFollowUpAssessment {
  signedAt: string;
  signedBy: string;
  encounterId: string;
  manualCorrectionsCount: number;
  generationMethod: 'scratchpad + claude-vision';
}
