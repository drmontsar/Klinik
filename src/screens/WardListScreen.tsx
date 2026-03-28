import React from 'react';
import type { Patient } from '../types/patient';
import { COLORS } from '../constants/colors';
import WardStats from '../components/ward/WardStats';
import PatientList from '../components/ward/PatientList';

/**
 * Ward list screen — shows all patients sorted by NEWS2 acuity
 * @param patients - Array of all ward patients
 * @param onSelectPatient - Callback when a patient is selected
 * @returns The main ward list view with stats bar and patient cards
 */
const WardListScreen: React.FC<{
    patients: Patient[];
    onSelectPatient: (patientId: string) => void;
    onAdmitPatient: () => void;
}> = ({ patients, onSelectPatient, onAdmitPatient }) => {
    // Derive unique ward names from patient locations (format: "Ward X, Bed Y")
    const uniqueWards = [...new Set(
        patients.map(p => p.location.split(',')[0].trim()).filter(Boolean)
    )];
    const wardSubtitle = uniqueWards.length > 0
        ? uniqueWards.join(' · ')
        : null;

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '28px', color: COLORS.brand, margin: 0, fontWeight: 700 }}>
                    KliniK Rounds
                </h1>
                <button
                    onClick={onAdmitPatient}
                    style={{
                        padding: '9px 18px',
                        backgroundColor: COLORS.brand,
                        color: COLORS.surface,
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    + Admit Patient
                </button>
            </div>

            {wardSubtitle && (
                <p style={{ fontSize: '15px', color: COLORS.textMuted, marginBottom: '24px', marginTop: '4px' }}>
                    {wardSubtitle}
                </p>
            )}

            {patients.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    color: COLORS.textMuted,
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏥</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: COLORS.text, marginBottom: '8px' }}>
                        No patients admitted yet
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '24px' }}>
                        Tap "Admit Patient" to add your first patient
                    </div>
                    <button
                        onClick={onAdmitPatient}
                        style={{
                            padding: '12px 28px',
                            backgroundColor: COLORS.brand,
                            color: COLORS.surface,
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Admit First Patient
                    </button>
                </div>
            ) : (
                <>
                    <WardStats patients={patients} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', color: COLORS.text, margin: 0 }}>Patient List</h2>
                        <div style={{ fontSize: '14px', color: COLORS.textMuted }}>
                            Sorted by NEWS2 acuity
                        </div>
                    </div>

                    <PatientList patients={patients} onSelectPatient={onSelectPatient} />
                </>
            )}
        </div>
    );
};

export default WardListScreen;
