import type { Patient } from '../../types/patient';

/**
 * Priya Sharma — Post-hemicolectomy Day 2
 * NEWS2: 6 — Borderline oliguria, low-grade fever
 */
export const priyaSharma: Patient = {
  id: 'patient-002',
  status: 'active',
  name: 'Priya Sharma',
  age: 58,
  sex: 'Female',
  hospitalNumber: 'MRN-2024-002',
  location: 'Surgical Oncology Ward 3, Bed C-08',
  consultant: 'Dr. Suresh Nair',
  diagnosis: 'Carcinoma sigmoid colon — post-right hemicolectomy Day 2',
  admissionDate: '2026-03-27',
  dayOfStay: 2,
  summary:
    'Post-hemicolectomy Day 2. Borderline oliguria — urine output 28ml/hr last 4 hours. Low-grade fever. IV fluids optimised. Renal function trending.',
  problems: [
    'Oliguria — urine output 28ml/hr, fluid challenge given',
    'Low-grade fever 38.2°C — wound infection vs. anastomotic complication',
    'Poorly controlled nausea — Ondansetron stepped up',
  ],
  // CLINICAL: NEWS2 = T→1 + HR→1 + SBP→1 + SpO2→1 + RR→2 + Alert→0 = 6
  vitals: {
    temperature: 38.3,
    heartRate: 110,
    systolicBP: 100,
    diastolicBP: 65,
    spO2: 95,
    respirationRate: 21,
    onSupplementalO2: false,
    spO2Scale: 1,
    consciousness: 'alert',
    recordedAt: new Date('2026-03-29T06:00:00').toISOString(),
  },
  news2Score: 6,
  medications: [
    {
      id: 'med-002-a',
      name: 'Inj. Metronidazole',
      dose: '500mg',
      route: 'IV',
      frequency: 'TDS',
      isActive: true,
      startDate: '2026-03-27',
    },
    {
      id: 'med-002-b',
      name: 'Inj. Cefuroxime',
      dose: '1.5g',
      route: 'IV',
      frequency: 'TDS',
      isActive: true,
      startDate: '2026-03-27',
    },
    {
      id: 'med-002-c',
      name: 'Inj. Ondansetron',
      dose: '8mg',
      route: 'IV',
      frequency: 'Q8H',
      isActive: true,
      startDate: '2026-03-27',
    },
    {
      id: 'med-002-d',
      name: 'Inj. Enoxaparin',
      dose: '40mg',
      route: 'SC',
      frequency: 'OD',
      isActive: true,
      startDate: '2026-03-27',
    },
  ],
  investigations: [
    {
      id: 'inv-002-a',
      testName: 'Serum Creatinine',
      value: '118',
      unit: 'µmol/L',
      normalRange: '44–97 µmol/L',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:00:00',
    },
    {
      id: 'inv-002-b',
      testName: 'Urine Output (4hr)',
      value: '112ml / 28ml/hr',
      unit: 'ml/hr',
      normalRange: '>0.5ml/kg/hr',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:00:00',
    },
    {
      id: 'inv-002-c',
      testName: 'CRP',
      value: '142',
      unit: 'mg/L',
      normalRange: '<5 mg/L',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:00:00',
    },
  ],
  notes: [
    {
      id: 'note-002-a',
      author: 'Dr. Suresh Nair',
      type: 'ward-round',
      content:
        'Post-hemicolectomy Day 2. Oliguria flagged overnight. 500ml Hartmann\'s bolus given — urine output improved transiently. Ongoing monitoring. Fever 38.3°C — wound looks clean. Anastomotic leak cannot yet be excluded. Repeat renal panel at 12:00.',
      isAIGenerated: false,
      isApproved: true,
      createdAt: '2026-03-29T07:30:00',
    },
  ],
  amendments: [],
};
