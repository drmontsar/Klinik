import React from 'react';
import type { Patient } from '../types/patient';
import { COLORS } from '../constants/colors';
import PatientHeader from '../components/detail/PatientHeader';
import ProblemsList from '../components/detail/ProblemsList';
import VitalsTrend from '../components/detail/VitalsTrend';
import MedicationsList from '../components/detail/MedicationsList';
import InvestigationsList from '../components/detail/InvestigationsList';
import NotesSummary from '../components/detail/NotesSummary';

/**
 * Patient detail screen — shows full clinical information for a selected patient
 * @param patient - The patient to display
 * @param onBack - Callback to return to the ward list
 * @param onStartScribing - Callback to begin a scribing session
 * @returns A comprehensive patient view with vitals, meds, investigations, and notes
 */
const PatientDetailScreen: React.FC<{
    patient: Patient;
    onBack: () => void;
    onStartScribing: () => void;
    onWriteNote: () => void;
    onDischarge: () => void;
}> = ({ patient, onBack, onStartScribing, onWriteNote, onDischarge }) => {
    const handleDischarge = () => {
        if (window.confirm(`Discharge ${patient.name}?\n\nThis will remove them from the ward list. The clinical record is preserved.`)) {
            onDischarge();
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px', backgroundColor: COLORS.bgSubtle, minHeight: '100vh' }}>
            {/* Top Navigation */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', zIndex: 10, padding: '16px 24px', borderBottom: `1px solid ${COLORS.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLORS.textTertiary, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <span>←</span> Back to Ward
                </button>
                <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>Patient Record</div>
            </div>

            <div style={{ padding: '24px' }}>
                <PatientHeader patient={patient} />

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
                    <ProblemsList problems={patient.problems} />
                    <VitalsTrend vitals={patient.vitals} />
                    <InvestigationsList investigations={patient.investigations} />
                    <MedicationsList medications={patient.medications} />
                    <NotesSummary notes={patient.notes} />
                </div>
            </div>

            {/* Bottom Floating Action Area */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTop: `1px solid ${COLORS.borderLight}`, padding: '14px 24px', display: 'flex', justifyContent: 'center', gap: '12px', boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)', zIndex: 20 }}>
                <button
                    onClick={handleDischarge}
                    style={{
                        backgroundColor: 'transparent',
                        color: COLORS.textMuted,
                        border: `1px solid ${COLORS.borderLight}`,
                        borderRadius: '24px',
                        padding: '11px 20px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Discharge
                </button>
                <button
                    onClick={onWriteNote}
                    style={{
                        backgroundColor: COLORS.surface,
                        color: COLORS.brand,
                        border: `2px solid ${COLORS.brand}`,
                        borderRadius: '24px',
                        padding: '11px 24px',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.brandSubtle; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.surface; }}
                >
                    <span style={{ fontSize: '18px' }}>✍️</span> Write Note
                </button>
                <button
                    onClick={onStartScribing}
                    style={{
                        backgroundColor: COLORS.brand,
                        color: COLORS.surface,
                        border: 'none',
                        borderRadius: '24px',
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: `0 4px 6px ${COLORS.brandShadow}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s, transform 0.1s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.brandDark; e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.brand; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <span style={{ fontSize: '18px' }}>🎙️</span> AI Scribing
                </button>
            </div>
        </div>
    );
};

export default PatientDetailScreen;
