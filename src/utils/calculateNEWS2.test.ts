/**
 * Comprehensive unit tests for NEWS2 scoring algorithm
 * @clinical-note Tests validate all boundary values per Royal College of Physicians specification
 */

import { describe, it, expect } from 'vitest';
import {
    calculateNEWS2,
    getNews2ResponseLevel,
    type VitalsInput,
} from './calculateNEWS2';

// ---------------------------------------------------------------------------
// Helper: creates a baseline "normal" vitals set (all score 0)
// ---------------------------------------------------------------------------
const normalVitals: VitalsInput = {
    respiratoryRate: 16,   // 12–20 → 0
    spo2: 97,              // ≥96 (Scale 1) → 0
    spO2Scale: 1,
    systolicBP: 120,       // 111–219 → 0
    heartRate: 72,          // 51–90 → 0
    temperature: 37.0,     // 36.1–38.0 → 0
    consciousness: 'alert', // → 0
    onSupplementalOxygen: false, // → 0
};

// ---------------------------------------------------------------------------
// Respiratory Rate Scoring
// ---------------------------------------------------------------------------
describe('Respiratory Rate scoring', () => {
    it('scores 3 for rate ≤ 8', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 8 });
        expect(result.breakdown['respiratoryRate']).toBe(3);
    });

    it('scores 3 for rate = 5 (extreme low)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 5 });
        expect(result.breakdown['respiratoryRate']).toBe(3);
    });

    it('scores 1 for rate 9–11 (lower boundary = 9)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 9 });
        expect(result.breakdown['respiratoryRate']).toBe(1);
    });

    it('scores 1 for rate 9–11 (upper boundary = 11)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 11 });
        expect(result.breakdown['respiratoryRate']).toBe(1);
    });

    it('scores 0 for rate 12–20 (lower boundary = 12)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 12 });
        expect(result.breakdown['respiratoryRate']).toBe(0);
    });

    it('scores 0 for rate 12–20 (upper boundary = 20)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 20 });
        expect(result.breakdown['respiratoryRate']).toBe(0);
    });

    it('scores 2 for rate 21–24 (lower boundary = 21)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 21 });
        expect(result.breakdown['respiratoryRate']).toBe(2);
    });

    it('scores 2 for rate 21–24 (upper boundary = 24)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 24 });
        expect(result.breakdown['respiratoryRate']).toBe(2);
    });

    it('scores 3 for rate ≥ 25', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 25 });
        expect(result.breakdown['respiratoryRate']).toBe(3);
    });

    it('scores 3 for rate = 40 (extreme high)', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: 40 });
        expect(result.breakdown['respiratoryRate']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// SpO2 Scale 1 Scoring (standard)
// ---------------------------------------------------------------------------
describe('SpO2 Scale 1 scoring (standard)', () => {
    it('scores 3 for SpO2 ≤ 91', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 91, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(3);
    });

    it('scores 3 for SpO2 = 85 (extreme low)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 85, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(3);
    });

    it('scores 2 for SpO2 92 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 92, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 2 for SpO2 93 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 93, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 1 for SpO2 94 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 94, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 1 for SpO2 95 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 95, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 0 for SpO2 ≥ 96', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 96, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(0);
    });

    it('scores 0 for SpO2 = 100', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 100, spO2Scale: 1 });
        expect(result.breakdown['spo2']).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// SpO2 Scale 2 Scoring (hypercapnic / COPD)
// ---------------------------------------------------------------------------
describe('SpO2 Scale 2 scoring (hypercapnic)', () => {
    it('scores 3 for SpO2 ≤ 83', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 83, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(3);
    });

    it('scores 2 for SpO2 84 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 84, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 2 for SpO2 85 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 85, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 1 for SpO2 86 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 86, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 1 for SpO2 87 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 87, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 0 for SpO2 88–92 (target range, lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 88, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(0);
    });

    it('scores 0 for SpO2 88–92 (target range, upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 92, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(0);
    });

    it('scores 1 for SpO2 93 (above target, lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 93, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 1 for SpO2 94 (above target, upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 94, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(1);
    });

    it('scores 2 for SpO2 95 (high, lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 95, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 2 for SpO2 96 (high, upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 96, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(2);
    });

    it('scores 3 for SpO2 ≥ 97 — dangerously high for Type 2 RF', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 97, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(3);
    });

    it('scores 3 for SpO2 100 on Scale 2', () => {
        const result = calculateNEWS2({ ...normalVitals, spo2: 100, spO2Scale: 2 });
        expect(result.breakdown['spo2']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// SpO2 Scale 1 vs Scale 2 Difference
// ---------------------------------------------------------------------------
describe('SpO2 Scale 1 vs Scale 2 comparison', () => {
    it('SpO2 97 scores 0 on Scale 1 but 3 on Scale 2', () => {
        const scale1 = calculateNEWS2({ ...normalVitals, spo2: 97, spO2Scale: 1 });
        const scale2 = calculateNEWS2({ ...normalVitals, spo2: 97, spO2Scale: 2 });
        expect(scale1.breakdown['spo2']).toBe(0);
        expect(scale2.breakdown['spo2']).toBe(3);
    });

    it('SpO2 88 scores 3 on Scale 1 but 0 on Scale 2', () => {
        const scale1 = calculateNEWS2({ ...normalVitals, spo2: 88, spO2Scale: 1 });
        const scale2 = calculateNEWS2({ ...normalVitals, spo2: 88, spO2Scale: 2 });
        expect(scale1.breakdown['spo2']).toBe(3);
        expect(scale2.breakdown['spo2']).toBe(0);
    });

    it('SpO2 95 scores 1 on Scale 1 but 2 on Scale 2', () => {
        const scale1 = calculateNEWS2({ ...normalVitals, spo2: 95, spO2Scale: 1 });
        const scale2 = calculateNEWS2({ ...normalVitals, spo2: 95, spO2Scale: 2 });
        expect(scale1.breakdown['spo2']).toBe(1);
        expect(scale2.breakdown['spo2']).toBe(2);
    });
});

// ---------------------------------------------------------------------------
// Systolic Blood Pressure Scoring
// ---------------------------------------------------------------------------
describe('Systolic BP scoring', () => {
    it('scores 3 for SBP ≤ 90', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 90 });
        expect(result.breakdown['systolicBP']).toBe(3);
    });

    it('scores 2 for SBP 91 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 91 });
        expect(result.breakdown['systolicBP']).toBe(2);
    });

    it('scores 2 for SBP 100 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 100 });
        expect(result.breakdown['systolicBP']).toBe(2);
    });

    it('scores 1 for SBP 101 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 101 });
        expect(result.breakdown['systolicBP']).toBe(1);
    });

    it('scores 1 for SBP 110 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 110 });
        expect(result.breakdown['systolicBP']).toBe(1);
    });

    it('scores 0 for SBP 111–219', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 140 });
        expect(result.breakdown['systolicBP']).toBe(0);
    });

    it('scores 0 for SBP 219 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 219 });
        expect(result.breakdown['systolicBP']).toBe(0);
    });

    it('scores 3 for SBP ≥ 220', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 220 });
        expect(result.breakdown['systolicBP']).toBe(3);
    });

    it('scores 3 for SBP = 260 (extreme high)', () => {
        const result = calculateNEWS2({ ...normalVitals, systolicBP: 260 });
        expect(result.breakdown['systolicBP']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// Heart Rate Scoring
// ---------------------------------------------------------------------------
describe('Heart Rate scoring', () => {
    it('scores 3 for HR ≤ 40', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 40 });
        expect(result.breakdown['heartRate']).toBe(3);
    });

    it('scores 1 for HR 41 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 41 });
        expect(result.breakdown['heartRate']).toBe(1);
    });

    it('scores 1 for HR 50 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 50 });
        expect(result.breakdown['heartRate']).toBe(1);
    });

    it('scores 0 for HR 51–90', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 72 });
        expect(result.breakdown['heartRate']).toBe(0);
    });

    it('scores 0 for HR 51 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 51 });
        expect(result.breakdown['heartRate']).toBe(0);
    });

    it('scores 0 for HR 90 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 90 });
        expect(result.breakdown['heartRate']).toBe(0);
    });

    it('scores 1 for HR 91 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 91 });
        expect(result.breakdown['heartRate']).toBe(1);
    });

    it('scores 1 for HR 110 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 110 });
        expect(result.breakdown['heartRate']).toBe(1);
    });

    it('scores 2 for HR 111 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 111 });
        expect(result.breakdown['heartRate']).toBe(2);
    });

    it('scores 2 for HR 130 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 130 });
        expect(result.breakdown['heartRate']).toBe(2);
    });

    it('scores 3 for HR ≥ 131', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 131 });
        expect(result.breakdown['heartRate']).toBe(3);
    });

    it('scores 3 for HR = 200 (extreme high)', () => {
        const result = calculateNEWS2({ ...normalVitals, heartRate: 200 });
        expect(result.breakdown['heartRate']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// Temperature Scoring
// ---------------------------------------------------------------------------
describe('Temperature scoring', () => {
    it('scores 3 for temp ≤ 35.0', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 35.0 });
        expect(result.breakdown['temperature']).toBe(3);
    });

    it('scores 3 for temp = 34.0 (extreme low)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 34.0 });
        expect(result.breakdown['temperature']).toBe(3);
    });

    it('scores 1 for temp 35.1 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 35.1 });
        expect(result.breakdown['temperature']).toBe(1);
    });

    it('scores 1 for temp 36.0 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 36.0 });
        expect(result.breakdown['temperature']).toBe(1);
    });

    it('scores 0 for temp 36.1–38.0 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 36.1 });
        expect(result.breakdown['temperature']).toBe(0);
    });

    it('scores 0 for temp 36.1–38.0 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 38.0 });
        expect(result.breakdown['temperature']).toBe(0);
    });

    it('scores 1 for temp 38.1 (lower boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 38.1 });
        expect(result.breakdown['temperature']).toBe(1);
    });

    it('scores 1 for temp 39.0 (upper boundary)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 39.0 });
        expect(result.breakdown['temperature']).toBe(1);
    });

    it('scores 2 for temp ≥ 39.1', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 39.1 });
        expect(result.breakdown['temperature']).toBe(2);
    });

    it('scores 2 for temp = 41.0 (extreme high)', () => {
        const result = calculateNEWS2({ ...normalVitals, temperature: 41.0 });
        expect(result.breakdown['temperature']).toBe(2);
    });
});

// ---------------------------------------------------------------------------
// Consciousness Scoring
// ---------------------------------------------------------------------------
describe('Consciousness scoring', () => {
    it('scores 0 for Alert', () => {
        const result = calculateNEWS2({ ...normalVitals, consciousness: 'alert' });
        expect(result.breakdown['consciousness']).toBe(0);
    });

    it('scores 3 for Confusion (new)', () => {
        const result = calculateNEWS2({ ...normalVitals, consciousness: 'confusion' });
        expect(result.breakdown['consciousness']).toBe(3);
    });

    it('scores 3 for Voice', () => {
        const result = calculateNEWS2({ ...normalVitals, consciousness: 'voice' });
        expect(result.breakdown['consciousness']).toBe(3);
    });

    it('scores 3 for Pain', () => {
        const result = calculateNEWS2({ ...normalVitals, consciousness: 'pain' });
        expect(result.breakdown['consciousness']).toBe(3);
    });

    it('scores 3 for Unresponsive', () => {
        const result = calculateNEWS2({ ...normalVitals, consciousness: 'unresponsive' });
        expect(result.breakdown['consciousness']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// Supplemental Oxygen
// ---------------------------------------------------------------------------
describe('Supplemental Oxygen scoring', () => {
    it('adds 0 when NOT on supplemental oxygen', () => {
        const result = calculateNEWS2({ ...normalVitals, onSupplementalOxygen: false });
        expect(result.breakdown['supplementalOxygen']).toBe(0);
    });

    it('adds 2 when on supplemental oxygen', () => {
        const result = calculateNEWS2({ ...normalVitals, onSupplementalOxygen: true });
        expect(result.breakdown['supplementalOxygen']).toBe(2);
    });

    it('supplemental O2 adds to total score', () => {
        const withoutO2 = calculateNEWS2({ ...normalVitals, onSupplementalOxygen: false });
        const withO2 = calculateNEWS2({ ...normalVitals, onSupplementalOxygen: true });
        expect(withO2.score).toBe(withoutO2.score + 2);
    });
});

// ---------------------------------------------------------------------------
// Missing Parameter Handling
// ---------------------------------------------------------------------------
describe('Missing parameter handling', () => {
    it('flags a single missing parameter', () => {
        const result = calculateNEWS2({ ...normalVitals, respiratoryRate: null });
        expect(result.missingParameters).toContain('respiratoryRate');
        expect(result.isComplete).toBe(false);
    });

    it('flags multiple missing parameters', () => {
        const result = calculateNEWS2({
            ...normalVitals,
            respiratoryRate: null,
            spo2: null,
            systolicBP: null,
        });
        expect(result.missingParameters).toEqual(
            expect.arrayContaining(['respiratoryRate', 'spo2', 'systolicBP']),
        );
        expect(result.missingParameters).toHaveLength(3);
        expect(result.isComplete).toBe(false);
    });

    it('does not include missing parameter score in total', () => {
        // respiratoryRate of 8 → score 3. If null, should not add 3.
        const withValue = calculateNEWS2({ ...normalVitals, respiratoryRate: 8 });
        const withNull = calculateNEWS2({ ...normalVitals, respiratoryRate: null });
        expect(withValue.score).toBe(withNull.score + 3);
    });

    it('flags all 5 nullable parameters when all null', () => {
        const result = calculateNEWS2({
            respiratoryRate: null,
            spo2: null,
            spO2Scale: 1,
            systolicBP: null,
            heartRate: null,
            temperature: null,
            consciousness: 'alert',
            onSupplementalOxygen: false,
        });
        expect(result.missingParameters).toHaveLength(5);
        expect(result.isComplete).toBe(false);
        // Only consciousness (0) and supplementalOxygen (0) scored
        expect(result.score).toBe(0);
    });

    it('isComplete is true when all parameters present', () => {
        const result = calculateNEWS2(normalVitals);
        expect(result.isComplete).toBe(true);
        expect(result.missingParameters).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Aggregate Score — Min / Max Scenarios
// ---------------------------------------------------------------------------
describe('Aggregate score scenarios', () => {
    it('minimum score = 0 with all normal vitals', () => {
        const result = calculateNEWS2(normalVitals);
        expect(result.score).toBe(0);
        expect(result.isComplete).toBe(true);
    });

    it('maximum score scenario — all parameters at worst', () => {
        // SAFETY: Maximum possible score test case
        const worstVitals: VitalsInput = {
            respiratoryRate: 4,       // → 3
            spo2: 80,                 // Scale 1: → 3
            spO2Scale: 1,
            systolicBP: 80,           // → 3
            heartRate: 150,           // → 3
            temperature: 34.0,        // → 3
            consciousness: 'unresponsive', // → 3
            onSupplementalOxygen: true,    // → 2
        };
        const result = calculateNEWS2(worstVitals);
        // 3 + 3 + 3 + 3 + 3 + 3 + 2 = 20
        expect(result.score).toBe(20);
        expect(result.breakdown['respiratoryRate']).toBe(3);
        expect(result.breakdown['spo2']).toBe(3);
        expect(result.breakdown['systolicBP']).toBe(3);
        expect(result.breakdown['heartRate']).toBe(3);
        expect(result.breakdown['temperature']).toBe(3);
        expect(result.breakdown['consciousness']).toBe(3);
        expect(result.breakdown['supplementalOxygen']).toBe(2);
    });

    it('real clinical scenario — P001 Rajesh Kumar (expected NEWS2 ~8)', () => {
        // POD 3 Whipple: RR 22, SpO2 94 on O2, SBP 105, HR 112, Temp 38.4, Alert
        const result = calculateNEWS2({
            respiratoryRate: 22,           // 21–24 → 2
            spo2: 94,                      // Scale 1: 94–95 → 1
            spO2Scale: 1,
            systolicBP: 105,               // 101–110 → 1
            heartRate: 112,                // 111–130 → 2
            temperature: 38.4,             // 38.1–39.0 → 1
            consciousness: 'alert',        // → 0
            onSupplementalOxygen: true,    // → 2
        });
        // 2 + 1 + 1 + 2 + 1 + 0 + 2 = 9
        expect(result.score).toBe(9);
        expect(result.isComplete).toBe(true);
    });

    it('real clinical scenario — P005 Vikram Patel confused (expected high)', () => {
        // POD 4 LAR: RR 24, SpO2 95 on O2, SBP 98, HR 108, Temp 37.6, Confusion
        const result = calculateNEWS2({
            respiratoryRate: 24,           // 21–24 → 2
            spo2: 95,                      // Scale 1: 94–95 → 1
            spO2Scale: 1,
            systolicBP: 98,                // 91–100 → 2
            heartRate: 108,                // 91–110 → 1
            temperature: 37.6,             // 36.1–38.0 → 0
            consciousness: 'confusion',    // → 3
            onSupplementalOxygen: true,    // → 2
        });
        // 2 + 1 + 2 + 1 + 0 + 3 + 2 = 11
        expect(result.score).toBe(11);
    });

    it('real clinical scenario — P004 Lakshmi Devi (expected low/zero)', () => {
        // POD 1 MRM: RR 14, SpO2 98, SBP 124, HR 82, Temp 36.6, Alert, no O2
        const result = calculateNEWS2({
            respiratoryRate: 14,           // 12–20 → 0
            spo2: 98,                      // Scale 1: ≥96 → 0
            spO2Scale: 1,
            systolicBP: 124,               // 111–219 → 0
            heartRate: 82,                 // 51–90 → 0
            temperature: 36.6,             // 36.1–38.0 → 0
            consciousness: 'alert',        // → 0
            onSupplementalOxygen: false,   // → 0
        });
        expect(result.score).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// getNews2ResponseLevel
// ---------------------------------------------------------------------------
describe('getNews2ResponseLevel', () => {
    it('returns LOW for score 0', () => {
        const level = getNews2ResponseLevel(0);
        expect(level.level).toBe('low');
        expect(level.label).toContain('LOW');
    });

    it('returns LOW for score 2', () => {
        const level = getNews2ResponseLevel(2);
        expect(level.level).toBe('low');
    });

    it('returns LOW-MEDIUM for score 3', () => {
        const level = getNews2ResponseLevel(3);
        expect(level.level).toBe('low-medium');
    });

    it('returns LOW-MEDIUM for score 4', () => {
        const level = getNews2ResponseLevel(4);
        expect(level.level).toBe('low-medium');
    });

    it('returns MEDIUM for score 5', () => {
        const level = getNews2ResponseLevel(5);
        expect(level.level).toBe('medium');
    });

    it('returns MEDIUM for score 6', () => {
        const level = getNews2ResponseLevel(6);
        expect(level.level).toBe('medium');
    });

    it('returns HIGH for score 7', () => {
        const level = getNews2ResponseLevel(7);
        expect(level.level).toBe('high');
    });

    it('returns HIGH for score 20 (maximum)', () => {
        const level = getNews2ResponseLevel(20);
        expect(level.level).toBe('high');
    });

    it('includes appropriate colors for each level', () => {
        const low = getNews2ResponseLevel(0);
        const medium = getNews2ResponseLevel(5);
        const high = getNews2ResponseLevel(7);

        expect(low.color).toBeTruthy();
        expect(low.bgColor).toBeTruthy();
        expect(medium.color).toBeTruthy();
        expect(medium.bgColor).toBeTruthy();
        expect(high.color).toBeTruthy();
        expect(high.bgColor).toBeTruthy();
    });

    it('includes monitoring frequency for each level', () => {
        expect(getNews2ResponseLevel(0).monitoringFrequency).toContain('12');
        expect(getNews2ResponseLevel(3).monitoringFrequency).toContain('4');
        expect(getNews2ResponseLevel(5).monitoringFrequency).toContain('1');
        expect(getNews2ResponseLevel(7).monitoringFrequency).toContain('Continuous');
    });

    it('includes action string for each level', () => {
        expect(getNews2ResponseLevel(0).action).toBeTruthy();
        expect(getNews2ResponseLevel(3).action).toBeTruthy();
        expect(getNews2ResponseLevel(5).action).toBeTruthy();
        expect(getNews2ResponseLevel(7).action).toBeTruthy();
    });
});
