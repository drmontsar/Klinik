import type { Patient } from '../types/patient';

/**
 * Mock patient data — intentionally empty in production.
 * Real patient records are created by the doctor via the Admit Patient form
 * and persisted to localStorage via LocalPatientRepository (MOCK_MODE = false).
 *
 * This array can be populated with synthetic data for isolated dev/test runs
 * (set MOCK_MODE = true in constants/config.ts) but must never ship with
 * real patient details.
 *
 * @clinical-note No patient data is seeded from code. All records are entered
 * by the treating doctor at the point of care.
 */

// CLINICAL: Empty by design. Do not add patient records here.
export const MOCK_PATIENTS: Patient[] = [];
