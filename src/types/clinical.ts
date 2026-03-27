/**
 * Clinical data TypeScript interfaces
 * Covers SOAP notes, clinical scores, and ward-level aggregates
 */

// CLINICAL: These types model clinical decision-support structures.

/**
 * Structured SOAP note — the canonical clinical note format for KliniK.
 * Every note, regardless of input method (voice, typed, template), produces this.
 * Never stored as plain text. Every clinical entity is a typed, queryable field.
 */
export interface StructuredSOAPNote {
  subjective: {
    /** Primary complaint in the patient's own words */
    chiefComplaint: string;
    /** Discrete symptom list */
    symptoms: string[];
    /** Pain score 0–10, null if not assessed */
    painScore: number | null;
    /** Verbatim patient statement */
    patientStatement: string;
  };
  objective: {
    // SAFETY: Vital signs are always numbers or null. Never strings.
    temperature: number | null;
    heartRate: number | null;
    systolicBP: number | null;
    diastolicBP: number | null;
    spo2: number | null;
    respiratoryRate: number | null;
    /** Physical examination findings */
    findings: string[];
  };
  assessment: {
    /** Primary diagnosis as stated by the doctor */
    primaryDiagnosis: string;
    /** Summary of all active problems */
    activeProblemsSummary: string;
    /** Clinical reasoning and interpretation */
    clinicalReasoning: string;
  };
  plan: {
    /** Investigation orders → investigation tracker */
    investigations: string[];
    // SAFETY: Medication orders are NEVER auto-confirmed.
    // Always require explicit doctor tap to confirm.
    // Medications are always unchecked by default in the review screen.
    /** Medication orders → pharmacy + nurse board */
    medications: string[];
    /** Nursing instructions → nurse task board */
    nursing: string[];
    /** Follow-up items → scheduling */
    followUp: string[];
    /** Complete plan list for display */
    allPlanItems: string[];
  };
  /** Human-readable display sections for doctor review */
  displayNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

/**
 * A clinician-signed SOAP note. Extends StructuredSOAPNote with audit fields.
 * @clinical-note Immutable once signed. Errors are formally amended, never deleted.
 */
export interface SignedSOAPNote extends StructuredSOAPNote {
  signedAt: string;
  signedBy: string;
  patientId: string;
  encounterId: string;
  consultationDurationSeconds: number;
  /** How many times the doctor edited AI output before signing */
  manualCorrectionsCount: number;
  generationMethod:
    | 'medASR + claude'
    | 'web-speech + claude'
    | 'typed-template'
    | 'typed-natural-language';
}

/**
 * Legacy flat SOAPNote — kept as alias for display-only contexts.
 * All new clinical logic must use StructuredSOAPNote.
 */
export type SOAPNote = StructuredSOAPNote;

/** NEWS2 score breakdown by parameter */
export interface NEWS2Breakdown {
  respirationRate: number;
  spO2: number;
  systolicBP: number;
  heartRate: number;
  consciousness: number;
  temperature: number;
  supplementalO2: number;
  total: number;
}

/** Risk level derived from NEWS2 aggregate */
export type RiskLevel = 'low' | 'low-medium' | 'medium' | 'high';

/** Ward-level statistics for the dashboard */
export interface WardStats {
  totalPatients: number;
  highRisk: number;
  mediumRisk: number;
  lowMediumRisk: number;
  lowRisk: number;
  roundsCompleted: number;
  roundsPending: number;
  averageTimeSaved: number;
}

/** A single voice order entry */
export interface VoiceOrder {
  id: string;
  patientId: string;
  orderText: string;
  orderType: 'medication' | 'investigation' | 'referral' | 'nursing' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  confirmedBy?: string;
}
