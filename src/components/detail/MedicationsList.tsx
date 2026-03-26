import React from 'react';
import type { Medication } from '../../types/patient';
import { COLORS } from '../../constants/colors';

/**
 * Displays the current medications list for a patient
 * @param medications - Array of medication records
 * @returns A table/list of active and recent medications
 * @clinical-note Active medications shown first; discontinued shown dimmed with end date
 */
const MedicationsList: React.FC<{ medications: Medication[] }> = ({ medications }) => {
    return (
        <div style={{ padding: '20px', backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.borderLight}`, marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💊</span> Medications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {medications.map(med => (
                    <div key={med.id} style={{
                        padding: '12px',
                        backgroundColor: med.isActive ? COLORS.blueLight : COLORS.bgSubtle,
                        border: `1px solid ${med.isActive ? COLORS.blueBorder : COLORS.borderLight}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: med.isActive ? 1 : 0.6
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: COLORS.text, fontSize: '15px' }}>
                                {med.name} <span style={{ fontWeight: 400, color: COLORS.textMuted }}>{med.dose}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: COLORS.textTertiary, marginTop: '4px' }}>
                                {med.route} · {med.frequency}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: COLORS.textMuted }}>
                            {med.isActive ? (
                                <span style={{ color: COLORS.blue, fontWeight: 500, backgroundColor: COLORS.blueBg, padding: '2px 8px', borderRadius: '12px' }}>Active</span>
                            ) : (
                                <span>Ended {med.endDate}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedicationsList;
