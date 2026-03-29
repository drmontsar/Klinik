/**
 * All demo ward patients — Surgical Oncology Ward 3.
 * Sorted by NEWS2 score descending (most acute first).
 *
 * TO USE REAL PATIENT DATA:
 * Set MOCK_MODE = false in constants/config.ts.
 * The app will use LocalPatientRepository (localStorage)
 * and this file is never loaded.
 *
 * TO ADD A DEMO PATIENT:
 * 1. Create src/data/patients/yourPatient.ts
 * 2. Import and add to the array below.
 * Nothing else changes.
 */

import { rajeshKumar } from './rajeshKumar';
import { priyaSharma } from './priyaSharma';
import { mohammedIsmail } from './mohammedIsmail';
import { anitaDesai } from './anitaDesai';
import { vikramSingh } from './vikramSingh';
import { sunitaRao } from './sunitaRao';
import { lakshmiNair } from './lakshmiNair';
import { arunPatel } from './arunPatel';

export {
  rajeshKumar,
  priyaSharma,
  mohammedIsmail,
  anitaDesai,
  vikramSingh,
  sunitaRao,
  lakshmiNair,
  arunPatel,
};

/** All demo patients sorted by NEWS2 descending */
export const DEMO_PATIENTS = [
  rajeshKumar,   // NEWS2: 8 — Post-Whipple Day 1
  priyaSharma,   // NEWS2: 6 — Post-hemicolectomy Day 2
  arunPatel,     // NEWS2: 5 — Post-gastrectomy Day 3 (ICU stepdown)
  mohammedIsmail, // NEWS2: 4 — Oesophageal Ca pre-op
  vikramSingh,   // NEWS2: 3 — Gastric Ca FLOT Cycle 2
  anitaDesai,    // NEWS2: 2 — Post-mastectomy Day 3
  sunitaRao,     // NEWS2: 1 — Post-anterior resection Day 5
  lakshmiNair,   // NEWS2: 0 — Post-thyroidectomy Day 7
];
