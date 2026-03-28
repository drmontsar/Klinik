import type { PatientRepository } from './patientRepository';
import { MockPatientRepository } from './mockPatientRepository';
import { LocalPatientRepository } from './localPatientRepository';
import { MOCK_MODE } from '../constants/config';

/** Singleton repository instance — shared across the entire app */
let instance: PatientRepository | null = null;

/**
 * Creates (or returns existing) patient data repository.
 * Returns a singleton so all components share the same data.
 *
 * MOCK_MODE = true  → MockPatientRepository (in-memory, demo data, resets on refresh)
 * MOCK_MODE = false → LocalPatientRepository (localStorage, real doctor data, persists)
 *
 * To switch to a real backend API:
 * 1. Build ApiPatientRepository implementing PatientRepository
 * 2. Import it here and return it when DATA_SOURCE = 'api'
 */
export const createRepository = (): PatientRepository => {
    if (!instance) {
        instance = MOCK_MODE
            ? new MockPatientRepository()
            : new LocalPatientRepository();
    }
    return instance;
};
