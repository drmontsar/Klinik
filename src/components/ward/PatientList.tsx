import React from 'react';
import type { Patient } from '../../types/patient';
import PatientCard from './PatientCard';

/**
 * Renders a scrollable list of patient cards sorted by NEWS2 score
 * @param patients - Array of patients to display
 * @param onSelectPatient - Callback when a patient card is tapped
 * @returns A sorted list of PatientCard components
 * @clinical-note Patients are sorted highest NEWS2 first for clinical prioritisation
 */
const PatientList: React.FC<{
    patients: Patient[];
    onSelectPatient: (patientId: string) => void;
}> = ({ patients, onSelectPatient }) => {
    // Sort highest NEWS2 score first
    const sortedPatients = [...patients].sort((a, b) => b.news2Score - a.news2Score);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedPatients.map(patient => (
                <PatientCard
                    key={patient.id}
                    patient={patient}
                    onClick={() => onSelectPatient(patient.id)}
                />
            ))}
        </div>
    );
};

export default PatientList;
