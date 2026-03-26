/**
 * Clinical data TypeScript interfaces
 * Covers SOAP notes, clinical scores, and ward-level aggregates
 */

// CLINICAL: These types model clinical decision-support structures.

/** SOAP note structure for ward round documentation */
export interface SOAPNote {
    /** Subjective — patient's reported symptoms and concerns */
    subjective: string;
    /** Objective — clinical findings, vitals, observations */
    objective: string;
    /** Assessment — clinical interpretation and differential */
    assessment: string;
    /** Plan — actions, orders, follow-up */
    plan: string;
}

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
