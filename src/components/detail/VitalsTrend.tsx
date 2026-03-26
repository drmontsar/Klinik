import React from 'react';
import type { Vitals } from '../../types/patient';
import { COLORS } from '../../constants/colors';
import { calculateNEWS2 } from '../../utils/calculateNEWS2';

/**
 * Displays vital signs trend over time as a chart or table
 * @param vitals - Current vitals observation set
 * @returns A visual display of vital sign values and trends
 * @clinical-note Values outside normal ranges are highlighted with clinical colors
 */
const VitalsTrend: React.FC<{ vitals: Vitals }> = ({ vitals }) => {
    const breakdown = calculateNEWS2({
        respiratoryRate: vitals.respirationRate,
        spo2: vitals.spO2,
        spO2Scale: vitals.spO2Scale,
        systolicBP: vitals.systolicBP,
        heartRate: vitals.heartRate,
        temperature: vitals.temperature,
        consciousness: vitals.consciousness,
        onSupplementalOxygen: vitals.onSupplementalO2
    }).breakdown;

    const getScoreColor = (score: number) => {
        if (score === 3) return COLORS.red;
        if (score === 2) return COLORS.amber;
        if (score === 1) return COLORS.yellow;
        return COLORS.text;
    };

    return (
        <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>❤️</span> Current Vitals
                </h3>
                <div style={{ fontSize: '12px', color: COLORS.textMuted }}>
                    Recorded at: {new Date(vitals.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                <VitalBox label="Resp Rate" value={`${vitals.respirationRate} bpm`} scoreColor={getScoreColor(breakdown['respiratoryRate'])} />
                <VitalBox label="SpO2" value={`${vitals.spO2}% ${vitals.onSupplementalO2 ? '(O2)' : '(Air)'}`} scoreColor={getScoreColor(breakdown['spo2'])} />
                <VitalBox label="Blood Pressure" value={`${vitals.systolicBP}/${vitals.diastolicBP}`} scoreColor={getScoreColor(breakdown['systolicBP'])} />
                <VitalBox label="Heart Rate" value={`${vitals.heartRate} bpm`} scoreColor={getScoreColor(breakdown['heartRate'])} />
                <VitalBox label="Temperature" value={`${vitals.temperature}°C`} scoreColor={getScoreColor(breakdown['temperature'])} />
                <VitalBox label="Consciousness" value={vitals.consciousness.toUpperCase()} scoreColor={getScoreColor(breakdown['consciousness'])} />
            </div>
        </div>
    );
};

const VitalBox: React.FC<{ label: string; value: string; scoreColor: string }> = ({ label, value, scoreColor }) => (
    <div style={{ padding: '12px', backgroundColor: COLORS.bgSubtle, borderRadius: '8px', border: `1px solid ${COLORS.borderLight}` }}>
        <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: scoreColor }}>{value}</div>
    </div>
);

export default VitalsTrend;
