/**
 * Patient-related TypeScript interfaces
 * Defines the core data model for patient records in KliniK Rounds
 * @clinical-note All patient data interfaces align with HL7 FHIR R5 where applicable
 */

// CLINICAL: These interfaces define the shape of patient clinical data.
// Changes here affect all downstream clinical displays.

/** Consciousness level — ACVPU scale used in NEWS2 */
export type ConsciousnessLevel = 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive';

/** SpO2 scale selection — determines scoring algorithm */
export type SpO2Scale = 1 | 2;

/**
 * Vital signs observation set
 * @clinical-note Each observation maps to a NEWS2 parameter
 */
export interface Vitals {
    /** Respiration rate in breaths per minute */
    respirationRate: number;
    /** Oxygen saturation percentage */
    spO2: number;
    /** Whether patient is on supplemental oxygen */
    onSupplementalO2: boolean;
    /** SpO2 scoring scale (1 = standard, 2 = hypercapnic risk) */
    spO2Scale: SpO2Scale;
    /** Systolic blood pressure in mmHg */
    systolicBP: number;
    /** Diastolic blood pressure in mmHg */
    diastolicBP: number;
    /** Heart rate in beats per minute */
    heartRate: number;
    /** Consciousness level on ACVPU scale */
    consciousness: ConsciousnessLevel;
    /** Body temperature in °C */
    temperature: number;
    /** Timestamp of observation */
    recordedAt: string;
}

/**
 * Medication order
 * @clinical-note Includes both active and recently discontinued medications
 */
export interface Medication {
    /** Unique medication ID */
    id: string;
    /** Drug name (generic) */
    name: string;
    /** Dose with units e.g. "500mg" */
    dose: string;
    /** Route of administration */
    route: 'oral' | 'IV' | 'IM' | 'SC' | 'topical' | 'inhaled' | 'PR';
    /** Frequency e.g. "BD", "TDS", "PRN" */
    frequency: string;
    /** Whether medication is currently active */
    isActive: boolean;
    /** Date prescription started */
    startDate: string;
    /** Date prescription ends (optional) */
    endDate?: string;
}

/**
 * Investigation / lab result
 * @clinical-note Abnormal results are flagged for clinical review
 */
export interface Investigation {
    /** Unique investigation ID */
    id: string;
    /** Test name e.g. "FBC", "U&E", "CRP" */
    testName: string;
    /** Result value as string (may include units) */
    value: string;
    /** Unit of measurement */
    unit: string;
    /** Normal range as display string */
    normalRange: string;
    /** Whether result is outside normal range */
    isAbnormal: boolean;
    /** Timestamp when result was reported */
    reportedAt: string;
}

/**
 * Clinical note entry
 * @clinical-note Notes may be AI-generated (via MedASR + SOAP) or manually entered
 */
export interface ClinicalNote {
    /** Unique note ID */
    id: string;
    /** Note author — clinician name or 'AI-Generated' */
    author: string;
    /** Note content, may be SOAP-structured */
    content: string;
    /** Note type */
    type: 'ward-round' | 'progress' | 'admission' | 'discharge' | 'procedure';
    /** Whether this note was AI-generated */
    isAIGenerated: boolean;
    /** Timestamp of note creation */
    createdAt: string;
    /** Whether the note has been clinician-approved */
    isApproved: boolean;
}

/**
 * Amendment to a clinical note
 * @clinical-note All amendments are immutable audit entries — originals are never deleted
 */
export interface Amendment {
    /** Unique amendment ID */
    id: string;
    /** ID of the note being amended */
    noteId: string;
    /** Original text before amendment */
    originalText: string;
    /** Amended text */
    amendedText: string;
    /** Reason for the amendment */
    reason: string;
    /** Clinician who made the amendment */
    amendedBy: string;
    /** Timestamp of amendment */
    amendedAt: string;
}

/**
 * The primary patient record
 * @clinical-note Represents a single patient encounter in a ward round
 */
export interface Patient {
    /** Unique patient identifier */
    id: string;
    /** Patient status — discharged patients are removed from the active ward list */
    status: 'active' | 'discharged';
    /** Patient full name */
    name: string;
    /** Age in years */
    age: number;
    /** Biological sex */
    sex: 'Male' | 'Female' | 'Other';
    /** Hospital Record Number / MRN */
    hospitalNumber: string;
    /** Ward / bed location */
    location: string;
    /** Primary consultant */
    consultant: string;
    /** Primary diagnosis */
    diagnosis: string;
    /** Admission date */
    admissionDate: string;
    /** Day of stay (post-op day if surgical) */
    dayOfStay: number;
    /** Active problems list */
    problems: string[];
    /** Current vital signs */
    vitals: Vitals;
    /** Current NEWS2 aggregate score */
    news2Score: number;
    /** Current medications */
    medications: Medication[];
    /** Recent investigations */
    investigations: Investigation[];
    /** Clinical notes */
    notes: ClinicalNote[];
    /** Note amendments */
    amendments: Amendment[];
    /** Brief clinical summary for the handover */
    summary: string;
}
