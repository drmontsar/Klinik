import type { Patient } from '../types/patient';
import { DEMO_PATIENTS } from './patients/index';

/**
 * Mock patient data used when MOCK_MODE = true.
 * Each patient lives in its own file under src/data/patients/.
 *
 * TO SWAP TO REAL DATA:
 * Set MOCK_MODE = false in constants/config.ts.
 * LocalPatientRepository takes over — this file is never loaded.
 *
 * @clinical-note All data is synthetic. Never ship with real patient details.
 */

// CLINICAL: Demo patients only. No real patient records here.
export const MOCK_PATIENTS: Patient[] = DEMO_PATIENTS;
