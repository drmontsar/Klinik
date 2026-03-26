/**
 * NEWS2 (National Early Warning Score 2) — Clinical Scoring Utility
 * Calculates aggregate early warning score from physiological parameters.
 * @clinical-note Every threshold is clinically mandated per Royal College of Physicians.
 *               Do NOT change scoring values without clinical governance approval.
 */

import { COLORS } from '../constants/colors';
import { NEWS2_THRESHOLDS } from '../constants/news2Thresholds';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Input vitals for NEWS2 calculation
 * @param respiratoryRate - breaths per minute (nullable if not recorded)
 * @param spo2 - oxygen saturation percentage (nullable if not recorded)
 * @param spO2Scale - 1 = standard, 2 = hypercapnic respiratory failure target 88-92
 * @param systolicBP - systolic blood pressure mmHg (nullable if not recorded)
 * @param heartRate - beats per minute (nullable if not recorded)
 * @param temperature - degrees Celsius (nullable if not recorded)
 * @param consciousness - ACVPU consciousness level
 * @param onSupplementalOxygen - whether patient is on any supplemental O2
 */
export interface VitalsInput {
    respiratoryRate: number | null;
    spo2: number | null;
    spO2Scale: 1 | 2;
    systolicBP: number | null;
    heartRate: number | null;
    temperature: number | null;
    consciousness: 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive';
    onSupplementalOxygen: boolean;
}

/**
 * Result of NEWS2 calculation
 * @param score - aggregate NEWS2 score
 * @param breakdown - individual score per parameter
 * @param missingParameters - names of any parameters that were null
 * @param isComplete - false if any parameter was missing
 */
export interface NEWS2Result {
    score: number;
    breakdown: Record<string, number>;
    missingParameters: string[];
    isComplete: boolean;
}

/**
 * Clinical response level derived from NEWS2 score
 * @param level - risk stratification tier
 * @param color - text color from design system
 * @param bgColor - background color from design system
 * @param label - human-readable risk label
 * @param action - clinically mandated response action
 * @param monitoringFrequency - minimum monitoring interval
 */
export interface ResponseLevel {
    level: 'low' | 'low-medium' | 'medium' | 'high';
    color: string;
    bgColor: string;
    label: string;
    action: string;
    monitoringFrequency: string;
}

// ---------------------------------------------------------------------------
// Individual Parameter Scoring Functions
// ---------------------------------------------------------------------------

/**
 * Scores respiratory rate per NEWS2 specification
 * @param rate - breaths per minute
 * @returns NEWS2 score 0–3
 * @clinical-note ≤8 or ≥25 are critical (score 3)
 */
// SAFETY: Respiratory rate thresholds are clinically mandated
const scoreRespiratoryRate = (rate: number): number => {
    if (rate <= 8) return 3;
    if (rate <= 11) return 1;
    if (rate <= 20) return 0;
    if (rate <= 24) return 2;
    return 3; // ≥25
};

/**
 * Scores SpO2 using Scale 1 (standard — room air patients)
 * @param spo2 - oxygen saturation percentage
 * @returns NEWS2 score 0–3
 * @clinical-note Scale 1 is the DEFAULT for all patients not confirmed Type 2 RF
 */
// SAFETY: SpO2 Scale 1 is for patients WITHOUT hypercapnic respiratory failure
const scoreSpO2Scale1 = (spo2: number): number => {
    if (spo2 <= 91) return 3;
    if (spo2 <= 93) return 2;
    if (spo2 <= 95) return 1;
    return 0; // ≥96
};

/**
 * Scores SpO2 using Scale 2 (hypercapnic respiratory failure / COPD target 88-92)
 * @param spo2 - oxygen saturation percentage
 * @returns NEWS2 score 0–3
 * @clinical-note Scale 2 ONLY for confirmed Type 2 RF with prescribed target range 88-92%
 */
// SAFETY: Scale 2 penalises BOTH low AND high SpO2 — high O2 is dangerous in these patients
const scoreSpO2Scale2 = (spo2: number): number => {
    if (spo2 <= 83) return 3;
    if (spo2 <= 85) return 2;
    if (spo2 <= 87) return 1;
    if (spo2 <= 92) return 0;
    if (spo2 <= 94) return 1;
    if (spo2 <= 96) return 2;
    return 3; // ≥97
};

/**
 * Scores systolic blood pressure per NEWS2 specification
 * @param sbp - systolic blood pressure in mmHg
 * @returns NEWS2 score 0–3
 * @clinical-note Both hypotension (≤90) and severe hypertension (≥220) score 3
 */
// SAFETY: Systolic BP thresholds are clinically mandated
const scoreSystolicBP = (sbp: number): number => {
    if (sbp <= 90) return 3;
    if (sbp <= 100) return 2;
    if (sbp <= 110) return 1;
    if (sbp <= 219) return 0;
    return 3; // ≥220
};

/**
 * Scores heart rate per NEWS2 specification
 * @param hr - heart rate in beats per minute
 * @returns NEWS2 score 0–3
 * @clinical-note Both extreme bradycardia (≤40) and tachycardia (≥131) score 3
 */
// SAFETY: Heart rate thresholds are clinically mandated
const scoreHeartRate = (hr: number): number => {
    if (hr <= 40) return 3;
    if (hr <= 50) return 1;
    if (hr <= 90) return 0;
    if (hr <= 110) return 1;
    if (hr <= 130) return 2;
    return 3; // ≥131
};

/**
 * Scores temperature per NEWS2 specification
 * @param temp - body temperature in °C
 * @returns NEWS2 score 0–3
 * @clinical-note Hypothermia (≤35.0) scores higher than hyperthermia (≥39.1)
 */
// SAFETY: Temperature thresholds are clinically mandated
const scoreTemperature = (temp: number): number => {
    if (temp <= 35.0) return 3;
    if (temp <= 36.0) return 1;
    if (temp <= 38.0) return 0;
    if (temp <= 39.0) return 1;
    return 2; // ≥39.1
};

/**
 * Scores consciousness level per NEWS2 ACVPU scale
 * @param level - consciousness level on ACVPU scale
 * @returns NEWS2 score: 0 for alert, 3 for anything else
 * @clinical-note ANY non-alert consciousness is critical (score 3)
 */
// SAFETY: New confusion is a RED FLAG and scores 3 — triggers urgent review
const scoreConsciousness = (
    level: 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive',
): number => {
    return level === 'alert' ? 0 : 3;
};

// ---------------------------------------------------------------------------
// Main Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the full NEWS2 score from a set of vital signs
 * @param vitals - the patient's current vital signs
 * @returns NEWS2Result with score, breakdown, and completeness info
 * @clinical-note A missing parameter is NEVER assumed to be zero.
 *               Missing params are flagged and isComplete is set to false.
 */
// SAFETY: This function drives clinical escalation decisions.
// A partial score with missing parameters MUST be clearly flagged.
export const calculateNEWS2 = (vitals: VitalsInput): NEWS2Result => {
    const breakdown: Record<string, number> = {};
    const missingParameters: string[] = [];
    let score = 0;

    // --- Respiratory Rate ---
    if (vitals.respiratoryRate !== null) {
        const paramScore = scoreRespiratoryRate(vitals.respiratoryRate);
        breakdown['respiratoryRate'] = paramScore;
        score += paramScore;
    } else {
        missingParameters.push('respiratoryRate');
    }

    // --- SpO2 ---
    if (vitals.spo2 !== null) {
        // CLINICAL: Scale selection is a critical clinical decision
        const paramScore =
            vitals.spO2Scale === 2
                ? scoreSpO2Scale2(vitals.spo2)
                : scoreSpO2Scale1(vitals.spo2);
        breakdown['spo2'] = paramScore;
        score += paramScore;
    } else {
        missingParameters.push('spo2');
    }

    // --- Systolic BP ---
    if (vitals.systolicBP !== null) {
        const paramScore = scoreSystolicBP(vitals.systolicBP);
        breakdown['systolicBP'] = paramScore;
        score += paramScore;
    } else {
        missingParameters.push('systolicBP');
    }

    // --- Heart Rate ---
    if (vitals.heartRate !== null) {
        const paramScore = scoreHeartRate(vitals.heartRate);
        breakdown['heartRate'] = paramScore;
        score += paramScore;
    } else {
        missingParameters.push('heartRate');
    }

    // --- Temperature ---
    if (vitals.temperature !== null) {
        const paramScore = scoreTemperature(vitals.temperature);
        breakdown['temperature'] = paramScore;
        score += paramScore;
    } else {
        missingParameters.push('temperature');
    }

    // --- Consciousness ---
    // CLINICAL: Consciousness is always required (cannot be null)
    const consciousnessScore = scoreConsciousness(vitals.consciousness);
    breakdown['consciousness'] = consciousnessScore;
    score += consciousnessScore;

    // --- Supplemental Oxygen ---
    // SAFETY: Add 2 to total if patient on ANY supplemental oxygen regardless of flow rate
    if (vitals.onSupplementalOxygen) {
        breakdown['supplementalOxygen'] = 2;
        score += 2;
    } else {
        breakdown['supplementalOxygen'] = 0;
    }

    return {
        score,
        breakdown,
        missingParameters,
        isComplete: missingParameters.length === 0,
    };
};

// ---------------------------------------------------------------------------
// Response Level Mapping
// ---------------------------------------------------------------------------

/**
 * Maps a NEWS2 aggregate score to a clinical response level
 * @param score - the NEWS2 aggregate score
 * @returns ResponseLevel with risk tier, colors, label, action, and monitoring frequency
 * @clinical-note Response levels drive clinical escalation protocols
 */
// SAFETY: These response levels are clinically mandated escalation tiers
export const getNews2ResponseLevel = (score: number): ResponseLevel => {
    if (score >= NEWS2_THRESHOLDS.HIGH_RISK) {
        return {
            level: 'high',
            color: COLORS.red,
            bgColor: COLORS.redBg,
            label: 'HIGH — Urgent/Emergency',
            action:
                'Emergency response — immediate senior clinician review, consider ICU transfer. Continuous monitoring.',
            monitoringFrequency: 'Continuous',
        };
    }

    if (score >= NEWS2_THRESHOLDS.MEDIUM_RISK) {
        return {
            level: 'medium',
            color: COLORS.amber,
            bgColor: COLORS.amberBg,
            label: 'MEDIUM — Urgent Response',
            action:
                'Key threshold for urgent response — inform medical team immediately. Minimum hourly observations.',
            monitoringFrequency: 'Minimum 1-hourly',
        };
    }

    if (score >= NEWS2_THRESHOLDS.LOW_MEDIUM) {
        return {
            level: 'low-medium',
            color: COLORS.yellow,
            bgColor: COLORS.yellowBg,
            label: 'LOW-MEDIUM — Ward Response',
            action:
                'Urgent ward-based response — inform registered nurse. Increase monitoring frequency.',
            monitoringFrequency: 'Minimum 4–6 hourly',
        };
    }

    return {
        level: 'low',
        color: COLORS.green,
        bgColor: COLORS.greenBg,
        label: 'LOW — Routine',
        action: 'Continue routine NEWS monitoring with standard observations.',
        monitoringFrequency: 'Minimum 12-hourly',
    };
};
