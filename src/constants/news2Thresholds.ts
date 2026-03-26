/**
 * NEWS2 (National Early Warning Score 2) — Clinical Thresholds
 * Used to stratify patients by acuity and trigger escalation protocols.
 * @clinical-note Based on Royal College of Physicians NEWS2 specification
 */

// SAFETY: These thresholds drive clinical escalation decisions.
// Do NOT change without clinical governance approval.

/** Aggregate score thresholds for clinical response triggers */
export const NEWS2_THRESHOLDS = {
    /** Score ≥ 7 — Urgent / critical care response */
    HIGH_RISK: 7,
    /** Score 5–6 — Urgent ward-based response */
    MEDIUM_RISK: 5,
    /** Score 3–4 — Low-medium, increase monitoring */
    LOW_MEDIUM: 3,
    /** Score 0–2 — Low risk, routine monitoring */
    LOW_RISK: 0,
} as const;

/**
 * Individual physiological parameter scoring ranges.
 * Each parameter scores 0–3 based on deviation from normal.
 * @clinical-note Score 3 in ANY single parameter triggers urgent review
 */
export const NEWS2_PARAMETER_RANGES = {
    /** Respiration rate (breaths per minute) */
    respirationRate: {
        score3Low: { min: 0, max: 8 },
        score1Low: { min: 9, max: 11 },
        score0: { min: 12, max: 20 },
        score2High: { min: 21, max: 24 },
        score3High: { min: 25, max: Infinity },
    },
    /** SpO2 Scale 1 (%) — for patients NOT at risk of hypercapnic respiratory failure */
    spO2Scale1: {
        score3Low: { min: 0, max: 91 },
        score2Low: { min: 92, max: 93 },
        score1Low: { min: 94, max: 95 },
        score0: { min: 96, max: Infinity },
    },
    /** SpO2 Scale 2 (%) — for patients at risk of hypercapnic respiratory failure */
    spO2Scale2: {
        score3Low: { min: 0, max: 83 },
        score2Low: { min: 84, max: 85 },
        score1Low: { min: 86, max: 87 },
        score0: { min: 88, max: 92 },
        score1High: { min: 93, max: 94 },
        score2High: { min: 95, max: 96 },
        score3High: { min: 97, max: Infinity },
    },
    /** Systolic blood pressure (mmHg) */
    systolicBP: {
        score3Low: { min: 0, max: 90 },
        score2Low: { min: 91, max: 100 },
        score1Low: { min: 101, max: 110 },
        score0: { min: 111, max: 219 },
        score3High: { min: 220, max: Infinity },
    },
    /** Heart / pulse rate (bpm) */
    heartRate: {
        score3Low: { min: 0, max: 40 },
        score1Low: { min: 41, max: 50 },
        score0: { min: 51, max: 90 },
        score1High: { min: 91, max: 110 },
        score2High: { min: 111, max: 130 },
        score3High: { min: 131, max: Infinity },
    },
    /** Consciousness level — ACVPU scale */
    consciousness: {
        alert: 0,
        confusion: 3,
        voice: 3,
        pain: 3,
        unresponsive: 3,
    },
    /** Temperature (°C) */
    temperature: {
        score3Low: { min: 0, max: 35.0 },
        score1Low: { min: 35.1, max: 36.0 },
        score0: { min: 36.1, max: 38.0 },
        score1High: { min: 38.1, max: 39.0 },
        score2High: { min: 39.1, max: Infinity },
    },
} as const;

/** Clinical response escalation mapping */
export const NEWS2_CLINICAL_RESPONSE = {
    LOW: {
        minScore: NEWS2_THRESHOLDS.LOW_RISK,
        maxScore: NEWS2_THRESHOLDS.LOW_MEDIUM - 1,
        frequency: 'Minimum 12-hourly',
        response: 'Continue routine NEWS monitoring',
    },
    LOW_MEDIUM: {
        minScore: NEWS2_THRESHOLDS.LOW_MEDIUM,
        maxScore: NEWS2_THRESHOLDS.MEDIUM_RISK - 1,
        frequency: 'Minimum 4–6 hourly',
        response: 'Urgent ward-based response — inform registered nurse',
    },
    MEDIUM: {
        minScore: NEWS2_THRESHOLDS.MEDIUM_RISK,
        maxScore: NEWS2_THRESHOLDS.HIGH_RISK - 1,
        frequency: 'Minimum 1-hourly',
        response: 'Key threshold for urgent response — inform medical team',
    },
    HIGH: {
        minScore: NEWS2_THRESHOLDS.HIGH_RISK,
        maxScore: Infinity,
        frequency: 'Continuous monitoring',
        response: 'Emergency response — immediate senior clinician review, consider ICU transfer',
    },
} as const;
