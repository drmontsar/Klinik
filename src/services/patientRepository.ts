/**
 * Patient data repository interface — defines all data operations.
 * Swap the implementation (mock → Firebase/API) without changing UI code.
 * @clinical-note All write operations should create audit-safe records
 */

import type { Patient, Vitals, Medication, Investigation, ClinicalNote, Amendment } from '../types/patient';

/**
 * Abstract data access contract for patient records.
 * Implementations: MockPatientRepository (dev), FirebasePatientRepository (prod), etc.
 */
export interface PatientRepository {
    // -----------------------------------------------------------------------
    // Reads
    // -----------------------------------------------------------------------

    /** Fetch all patients in the current ward */
    getAllPatients(): Promise<Patient[]>;

    /** Fetch a single patient by ID */
    getPatientById(id: string): Promise<Patient | undefined>;

    // -----------------------------------------------------------------------
    // Writes — clinical data generation
    // -----------------------------------------------------------------------

    /** Add a clinical note to a patient record */
    addNote(patientId: string, note: ClinicalNote): Promise<void>;

    /** Add an amendment to a patient's existing note */
    addAmendment(patientId: string, amendment: Amendment): Promise<void>;

    /** Update a patient's vital signs observation */
    updateVitals(patientId: string, vitals: Vitals): Promise<void>;

    /** Add a medication order to a patient */
    addMedication(patientId: string, medication: Medication): Promise<void>;

    /** Add an investigation result to a patient */
    addInvestigation(patientId: string, investigation: Investigation): Promise<void>;

    /**
     * Admit a new patient to the ward.
     * Creates the patient record and returns it with a generated ID.
     * @param data - All patient fields except id (generated server-side)
     * @returns The newly created patient with its assigned ID
     */
    admitPatient(data: Omit<Patient, 'id'>): Promise<Patient>;
}
