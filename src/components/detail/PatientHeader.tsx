import React from 'react';
import type { Patient } from '../../types/patient';
import { COLORS } from '../../constants/colors';
import { formatClinicalDate } from '../../utils/formatClinical';
import NEWS2Badge from '../ward/NEWS2Badge';

/**
 * Displays the patient header with demographics, diagnosis, and NEWS2 score
 * @param patient - The patient to display
 * @returns A header section for the patient detail screen
 * @clinical-note Shows critical identifiers: name, hospital number, age/sex, consultant
 */
const PatientHeader: React.FC<{ patient: Patient }> = ({ patient }) => {
    return (
        <div style={{ padding: '24px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: COLORS.text }}>{patient.name}</h2>
                    <div style={{ display: 'flex', gap: '16px', color: COLORS.textTertiary, fontSize: '14px', marginBottom: '12px' }}>
                        <span><strong>MRN:</strong> {patient.hospitalNumber}</span>
                        <span><strong>Age/Sex:</strong> {patient.age}y {patient.sex}</span>
                        <span><strong>Location:</strong> {patient.location}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <NEWS2Badge score={patient.news2Score} />
                    <div style={{ marginTop: '8px', fontSize: '14px', color: COLORS.textMuted }}>
                        Admitted: {formatClinicalDate(patient.admissionDate)}
                        <br />
                        Day of stay: {patient.dayOfStay}
                    </div>
                </div>
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <span style={{ color: COLORS.textMuted, fontSize: '14px' }}>Primary Diagnosis:</span>
                    <div style={{ color: COLORS.text, fontWeight: 500, fontSize: '16px', marginTop: '4px' }}>{patient.diagnosis}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: COLORS.textMuted, fontSize: '14px' }}>Consultant:</span>
                    <div style={{ color: COLORS.text, fontWeight: 500, fontSize: '16px', marginTop: '4px' }}>{patient.consultant}</div>
                </div>
            </div>
        </div>
    );
};

export default PatientHeader;
