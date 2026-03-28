/**
 * Mock implementation of PatientRepository — backed by in-memory array.
 * Reads and writes operate on the imported MOCK_PATIENTS data.
 * @clinical-note All data is synthetic — for development and testing only.
 */

import type { Patient, Vitals, Medication, Investigation, ClinicalNote, Amendment } from '../types/patient';
import type { PatientRepository } from './patientRepository';
import { MOCK_PATIENTS } from '../data/mockPatients';

export class MockPatientRepository implements PatientRepository {
    /** In-memory patient store — shallow copy so writes don't mutate the original import */
    private patients: Patient[] = MOCK_PATIENTS.map(p => ({ ...p }));

    // -----------------------------------------------------------------------
    // Reads
    // -----------------------------------------------------------------------

    async getAllPatients(): Promise<Patient[]> {
        // Return active patients only — discharged patients are removed from the ward list
        return this.patients.filter(p => p.status !== 'discharged').map(p => ({ ...p }));
    }

    async getPatientById(id: string): Promise<Patient | undefined> {
        return this.patients.find(p => p.id === id);
    }

    // -----------------------------------------------------------------------
    // Writes
    // -----------------------------------------------------------------------

    async addNote(patientId: string, note: ClinicalNote): Promise<void> {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) throw new Error(`Patient ${patientId} not found`);
        patient.notes = [...patient.notes, note];
    }

    async addAmendment(patientId: string, amendment: Amendment): Promise<void> {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) throw new Error(`Patient ${patientId} not found`);
        // CLINICAL: Amendments are immutable audit entries — originals are never deleted
        patient.amendments = [...patient.amendments, amendment];
    }

    async updateVitals(patientId: string, vitals: Vitals): Promise<void> {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) throw new Error(`Patient ${patientId} not found`);
        patient.vitals = vitals;
    }

    async addMedication(patientId: string, medication: Medication): Promise<void> {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) throw new Error(`Patient ${patientId} not found`);
        patient.medications = [...patient.medications, medication];
    }

    async addInvestigation(patientId: string, investigation: Investigation): Promise<void> {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) throw new Error(`Patient ${patientId} not found`);
        patient.investigations = [...patient.investigations, investigation];
    }

    async admitPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
        // Generate a sequential hospital-style ID based on current count
        const nextNum = String(this.patients.length + 1).padStart(3, '0');
        const patient: Patient = { ...data, id: `P${nextNum}` };
        this.patients.push(patient);
        return { ...patient };
    }

    async dischargePatient(id: string): Promise<void> {
        const patient = this.patients.find(p => p.id === id);
        if (!patient) throw new Error(`Patient ${id} not found`);
        // CLINICAL: Discharge sets status — record is preserved, not deleted
        patient.status = 'discharged';
    }
}
