import type { PatientRepository } from './patientRepository';
import { MockPatientRepository } from './mockPatientRepository';

/** Singleton repository instance — shared across the entire app */
let instance: PatientRepository | null = null;

/**
 * Creates (or returns existing) patient data repository.
 * Returns a singleton so all components share the same data.
 */
export const createRepository = (): PatientRepository => {
    if (!instance) {
        // TODO: When scaling to production, swap this for your real implementation:
        // instance = new FirebasePatientRepository();
        instance = new MockPatientRepository();
    }
    return instance;
};
