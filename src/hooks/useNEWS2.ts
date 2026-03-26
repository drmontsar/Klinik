import { useMemo } from 'react';
import type { Vitals } from '../types/patient';
import { calculateNEWS2, getNews2ResponseLevel } from '../utils/calculateNEWS2';

/**
 * Calculates and returns the NEWS2 score for a given set of vitals
 * @param vitals - Optional vitals to calculate from
 * @returns NEWS2 total score, breakdown by parameter, and risk level
 * @clinical-note Uses NEWS2_THRESHOLDS from constants — never hardcodes values
 */
const useNEWS2 = (vitals?: Vitals) => {
    return useMemo(() => {
        if (!vitals) {
            return {
                totalScore: 0,
                riskLevel: 'low' as 'low' | 'low-medium' | 'medium' | 'high',
                breakdown: {
                    respirationRate: 0,
                    spO2: 0,
                    systolicBP: 0,
                    heartRate: 0,
                    consciousness: 0,
                    temperature: 0,
                    supplementalO2: 0,
                },
            };
        }

        const result = calculateNEWS2({
            respiratoryRate: vitals.respirationRate,
            spo2: vitals.spO2,
            spO2Scale: vitals.spO2Scale,
            systolicBP: vitals.systolicBP,
            heartRate: vitals.heartRate,
            temperature: vitals.temperature,
            consciousness: vitals.consciousness,
            onSupplementalOxygen: vitals.onSupplementalO2,
        });

        const responseLevel = getNews2ResponseLevel(result.score);

        return {
            totalScore: result.score,
            riskLevel: responseLevel.level,
            breakdown: {
                respirationRate: result.breakdown['respiratoryRate'] || 0,
                spO2: result.breakdown['spo2'] || 0,
                systolicBP: result.breakdown['systolicBP'] || 0,
                heartRate: result.breakdown['heartRate'] || 0,
                consciousness: result.breakdown['consciousness'] || 0,
                temperature: result.breakdown['temperature'] || 0,
                supplementalO2: result.breakdown['supplementalOxygen'] || 0,
            },
        };
    }, [vitals]);
};

export default useNEWS2;
