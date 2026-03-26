import React from 'react';
import type { Patient } from '../../types/patient';
import { COLORS } from '../../constants/colors';
import NEWS2Badge from './NEWS2Badge';
import { getNews2ResponseLevel } from '../../utils/calculateNEWS2';

/**
 * Displays a single patient summary card in the ward list
 * @param patient - The patient data to display
 * @returns A card component showing patient name, diagnosis, location, and NEWS2 score
 * @clinical-note Card border color changes based on NEWS2 risk level
 */
const PatientCard: React.FC<{ patient: Patient; onClick?: () => void }> = ({ patient, onClick }) => {
    const responseLevel = getNews2ResponseLevel(patient.news2Score);

    return (
        <div
            onClick={onClick}
            style={{
                borderLeft: `6px solid ${responseLevel.color}`,
                borderTop: `1px solid ${COLORS.borderLight}`,
                borderRight: `1px solid ${COLORS.borderLight}`,
                borderBottom: `1px solid ${COLORS.borderLight}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                cursor: onClick ? 'pointer' : 'default',
                backgroundColor: COLORS.surface,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)';
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                }
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: COLORS.text }}>{patient.name}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: COLORS.textMuted }}>
                        {patient.age}y {patient.sex} · {patient.hospitalNumber}
                    </p>
                </div>
                <NEWS2Badge score={patient.news2Score} />
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary, margin: '8px 0 0 0' }}>
                <span style={{ color: COLORS.textMuted }}>Location:</span> {patient.location}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                <span style={{ color: COLORS.textMuted }}>Diagnosis:</span> {patient.diagnosis}
            </div>
        </div>
    );
};

export default PatientCard;
