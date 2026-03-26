import React from 'react';
import type { Patient } from '../../types/patient';
import { COLORS } from '../../constants/colors';

/**
 * Displays aggregate ward statistics — patient counts by risk level, round progress
 * @returns A statistics summary bar for the top of the ward list
 * @clinical-note Provides at-a-glance situational awareness for the clinical team
 */
const WardStats: React.FC<{ patients: Patient[] }> = ({ patients }) => {
    const highRisk = patients.filter(p => p.news2Score >= 7).length;
    const mediumRisk = patients.filter(p => p.news2Score >= 5 && p.news2Score <= 6).length;

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            backgroundColor: COLORS.bgMuted,
            borderRadius: '12px',
            marginBottom: '24px'
        }}>
            <div style={{ flex: 1, backgroundColor: COLORS.surface, padding: '12px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.text }}>{patients.length}</div>
                <div style={{ fontSize: '11px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Total Patients</div>
            </div>
            <div style={{ flex: 1, backgroundColor: COLORS.redBgLight, padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${COLORS.redBorder}` }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.red }}>{highRisk}</div>
                <div style={{ fontSize: '11px', color: COLORS.red, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>High Risk (≥7)</div>
            </div>
            <div style={{ flex: 1, backgroundColor: COLORS.amberBgLight, padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${COLORS.amberBorder}` }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.amber }}>{mediumRisk}</div>
                <div style={{ fontSize: '11px', color: COLORS.amber, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Medium Risk (5-6)</div>
            </div>
        </div>
    );
};

export default WardStats;
