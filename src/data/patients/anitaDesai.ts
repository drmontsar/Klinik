import type { Patient } from '../../types/patient';

/**
 * Anita Desai — Post-mastectomy Day 3
 * NEWS2: 2 — Recovering well, drain output reducing
 */
export const anitaDesai: Patient = {
  id: 'patient-004',
  status: 'active',
  name: 'Anita Desai',
  age: 45,
  sex: 'Female',
  hospitalNumber: 'MRN-2024-004',
  location: 'Surgical Oncology Ward 3, Bed D-11',
  consultant: 'Dr. Suresh Nair',
  diagnosis: 'Carcinoma right breast (ER+/PR+/HER2−) — post-right mastectomy + axillary clearance Day 3',
  admissionDate: '2026-03-26',
  dayOfStay: 3,
  summary:
    'Post-mastectomy Day 3. Recovering well. Drain output 35ml today, reducing. Pain controlled on oral analgesia. Likely for discharge Day 5 if drain output <30ml/day.',
  problems: [
    'Post-right mastectomy + axillary clearance — Day 3',
    'Seroma risk — drain in situ, output 35ml today',
    'Lymphoedema counselling — physiotherapy referral pending',
  ],
  // CLINICAL: NEWS2 = T→1 + HR→1 + SBP→0 + SpO2→0 + RR→0 + Alert→0 = 2
  vitals: {
    temperature: 37.6,
    heartRate: 94,
    systolicBP: 118,
    diastolicBP: 76,
    spO2: 96,
    respirationRate: 16,
    onSupplementalO2: false,
    spO2Scale: 1,
    consciousness: 'alert',
    recordedAt: new Date('2026-03-29T06:00:00').toISOString(),
  },
  news2Score: 2,
  medications: [
    {
      id: 'med-004-a',
      name: 'Tab. Paracetamol',
      dose: '1g',
      route: 'oral',
      frequency: 'QID',
      isActive: true,
      startDate: '2026-03-26',
    },
    {
      id: 'med-004-b',
      name: 'Tab. Ibuprofen',
      dose: '400mg',
      route: 'oral',
      frequency: 'TDS with food',
      isActive: true,
      startDate: '2026-03-26',
    },
    {
      id: 'med-004-c',
      name: 'Inj. Enoxaparin',
      dose: '40mg',
      route: 'SC',
      frequency: 'OD',
      isActive: true,
      startDate: '2026-03-26',
    },
    {
      id: 'med-004-d',
      name: 'Tab. Tamoxifen',
      dose: '20mg',
      route: 'oral',
      frequency: 'OD',
      isActive: true,
      startDate: '2026-03-28',
    },
  ],
  investigations: [
    {
      id: 'inv-004-a',
      testName: 'Haemoglobin',
      value: '11.2',
      unit: 'g/dL',
      normalRange: '12.0–16.0 g/dL',
      isAbnormal: true,
      reportedAt: '2026-03-27T09:00:00',
    },
    {
      id: 'inv-004-b',
      testName: 'Histopathology',
      value: 'ER+ PR+ HER2− Grade 2, pT2N1 — 2/14 nodes positive',
      unit: '',
      normalRange: '',
      isAbnormal: false,
      reportedAt: '2026-03-28T16:00:00',
    },
    {
      id: 'inv-004-c',
      testName: 'Wound Drain Output',
      value: '35ml today, 68ml yesterday',
      unit: 'ml/day',
      normalRange: '<30ml/day for removal',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:00:00',
    },
  ],
  notes: [
    {
      id: 'note-004-a',
      author: 'Dr. Suresh Nair',
      type: 'ward-round',
      content:
        'Post-mastectomy Day 3. Wound site clean and dry. Drain output 35ml — reducing trend. Histopathology finalised: ER+PR+ HER2− pT2N1. Oncology team to review for adjuvant chemotherapy planning. Discharge planned Day 5 if drain output meets threshold.',
      isAIGenerated: false,
      isApproved: true,
      createdAt: '2026-03-29T08:00:00',
    },
  ],
  amendments: [],
};
