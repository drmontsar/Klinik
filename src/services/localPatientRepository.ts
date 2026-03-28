/**
 * Local (localStorage) implementation of PatientRepository.
 * Persists patient records on the doctor's device across sessions.
 *
 * @clinical-note This is the implementation used for real clinical use.
 * Data lives on the doctor's device — phone, tablet, or computer.
 * It survives app restarts and page refreshes.
 * It does NOT sync between devices (that requires the API implementation).
 *
 * @dev Swap to ApiPatientRepository in createRepository.ts when
 * the backend is ready. Nothing else changes.
 */

import type {
    Patient,
    Vitals,
    Medication,
    Investigation,
    ClinicalNote,
    Amendment,
} from '../types/patient';
import type { PatientRepository } from './patientRepository';

// CLINICAL: Versioned key — bump to 'v2' if the Patient schema changes
// so old data does not silently corrupt new code.
const STORAGE_KEY = 'klinik_patients_v1';

/**
 * Read all patients from localStorage.
 * Returns empty array if nothing is stored or if storage is corrupt.
 */
function readStore(): Patient[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const patients = JSON.parse(raw) as Patient[];
        // Migrate records saved before the status field was added
        return patients.map(p => p.status ? p : { ...p, status: 'active' as const });
    } catch {
        // SAFETY: If storage is corrupt, start fresh rather than crashing.
        console.warn('[KliniK] LocalPatientRepository: storage corrupted, resetting.');
        return [];
    }
}

/**
 * Write all patients back to localStorage.
 */
function writeStore(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

export class LocalPatientRepository implements PatientRepository {
    // -----------------------------------------------------------------------
    // Reads
    // -----------------------------------------------------------------------

    async getAllPatients(): Promise<Patient[]> {
        // Return active patients only — discharged patients are removed from the ward list
        return readStore().filter(p => p.status !== 'discharged');
    }

    async getPatientById(id: string): Promise<Patient | undefined> {
        return readStore().find(p => p.id === id);
    }

    // -----------------------------------------------------------------------
    // Writes — all writes: read → modify → write back atomically
    // -----------------------------------------------------------------------

    async addNote(patientId: string, note: ClinicalNote): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx === -1) throw new Error(`Patient ${patientId} not found`);
        // CLINICAL: Notes are immutable — append only, never replace
        patients[idx] = {
            ...patients[idx],
            notes: [...patients[idx].notes, note],
        };
        writeStore(patients);
    }

    async addAmendment(patientId: string, amendment: Amendment): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx === -1) throw new Error(`Patient ${patientId} not found`);
        // CLINICAL: Amendments are immutable audit entries — originals are never deleted
        patients[idx] = {
            ...patients[idx],
            amendments: [...patients[idx].amendments, amendment],
        };
        writeStore(patients);
    }

    async updateVitals(patientId: string, vitals: Vitals): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx === -1) throw new Error(`Patient ${patientId} not found`);
        patients[idx] = { ...patients[idx], vitals };
        writeStore(patients);
    }

    async addMedication(patientId: string, medication: Medication): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx === -1) throw new Error(`Patient ${patientId} not found`);
        patients[idx] = {
            ...patients[idx],
            medications: [...patients[idx].medications, medication],
        };
        writeStore(patients);
    }

    async addInvestigation(patientId: string, investigation: Investigation): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx === -1) throw new Error(`Patient ${patientId} not found`);
        patients[idx] = {
            ...patients[idx],
            investigations: [...patients[idx].investigations, investigation],
        };
        writeStore(patients);
    }

    async admitPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
        const patients = readStore();
        // Generate a unique ID using timestamp + random suffix to avoid collisions
        const id = `P-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const patient: Patient = { ...data, id };
        patients.push(patient);
        writeStore(patients);
        return { ...patient };
    }

    async dischargePatient(id: string): Promise<void> {
        const patients = readStore();
        const idx = patients.findIndex(p => p.id === id);
        if (idx === -1) throw new Error(`Patient ${id} not found`);
        // CLINICAL: Discharge sets status — record is preserved in localStorage, not deleted
        patients[idx] = { ...patients[idx], status: 'discharged' };
        writeStore(patients);
    }
}
