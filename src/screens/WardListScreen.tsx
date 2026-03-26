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
}> = ({ patients, onSelectPatient }) => {
    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ fontSize: '28px', color: COLORS.brand, marginBottom: '8px', fontWeight: 700 }}>
                KliniK Rounds
            </h1>
            <p style={{ fontSize: '16px', color: COLORS.textMuted, marginBottom: '24px' }}>
                Ward 4 — Surgical Oncology
            </p>

            <WardStats patients={patients} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', color: COLORS.text, margin: 0 }}>Patient List</h2>
                <div style={{ fontSize: '14px', color: COLORS.textMuted }}>
                    Sorted by NEWS2 acuity
                </div>
            </div>

            <PatientList patients={patients} onSelectPatient={onSelectPatient} />
        </div>
    );
};

export default WardListScreen;
