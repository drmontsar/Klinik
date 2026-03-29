import type { Patient } from '../../types/patient';

/**
 * Lakshmi Nair — Post-thyroidectomy Day 7
 * NEWS2: 0 — Stable, for discharge today, calcium stable
 */
export const lakshmiNair: Patient = {
  id: 'patient-007',
  status: 'active',
  name: 'Lakshmi Nair',
  age: 49,
  sex: 'Female',
  hospitalNumber: 'MRN-2024-007',
  location: 'Surgical Oncology Ward 3, Bed A-09',
  consultant: 'Dr. Suresh Nair',
  diagnosis: 'Papillary carcinoma thyroid — post-total thyroidectomy + central neck dissection Day 7',
  admissionDate: '2026-03-22',
  dayOfStay: 7,
  summary:
    'Post-thyroidectomy Day 7. Stable and fit for discharge today. Calcium 2.24mmol/L — within normal range on oral supplements. Thyroxine started. Radioactive iodine ablation to be planned as outpatient.',
  problems: [
    'Papillary carcinoma thyroid — total thyroidectomy + central neck dissection complete',
    'Hypoparathyroidism risk — calcium monitored, currently stable on supplements',
    'Hypothyroidism — Levothyroxine commenced Day 3',
    'Radioactive iodine ablation — to be arranged as outpatient in 6–8 weeks',
  ],
  // CLINICAL: NEWS2 = T→0 + HR→0 + SBP→0 + SpO2→0 + RR→0 + Alert→0 = 0
  vitals: {
    temperature: 36.8,
    heartRate: 74,
    systolicBP: 122,
    diastolicBP: 78,
    spO2: 98,
    respirationRate: 16,
    onSupplementalO2: false,
    spO2Scale: 1,
    consciousness: 'alert',
    recordedAt: new Date('2026-03-29T06:00:00').toISOString(),
  },
  news2Score: 0,
  medications: [
    {
      id: 'med-007-a',
      name: 'Tab. Levothyroxine',
      dose: '100mcg',
      route: 'oral',
      frequency: 'OD (fasting)',
      isActive: true,
      startDate: '2026-03-25',
    },
    {
      id: 'med-007-b',
      name: 'Tab. Calcium Carbonate + Vit D3',
      dose: '1250mg + 400IU',
      route: 'oral',
      frequency: 'BD',
      isActive: true,
      startDate: '2026-03-22',
    },
    {
      id: 'med-007-c',
      name: 'Tab. Paracetamol',
      dose: '500mg',
      route: 'oral',
      frequency: 'PRN',
      isActive: true,
      startDate: '2026-03-22',
    },
  ],
  investigations: [
    {
      id: 'inv-007-a',
      testName: 'Serum Calcium',
      value: '2.24',
      unit: 'mmol/L',
      normalRange: '2.10–2.55 mmol/L',
      isAbnormal: false,
      reportedAt: '2026-03-29T06:00:00',
    },
    {
      id: 'inv-007-b',
      testName: 'PTH',
      value: '9.2',
      unit: 'pg/mL',
      normalRange: '10–65 pg/mL',
      isAbnormal: true,
      reportedAt: '2026-03-27T09:00:00',
    },
    {
      id: 'inv-007-c',
      testName: 'TSH',
      value: 'Pending (Day 14 target TSH 0.1–0.5 mU/L)',
      unit: 'mU/L',
      normalRange: '0.1–0.5 mU/L (suppressed, post-thyroidectomy)',
      isAbnormal: false,
      reportedAt: '2026-03-29T07:00:00',
    },
    {
      id: 'inv-007-d',
      testName: 'Histopathology',
      value: 'Papillary thyroid carcinoma pT2N0, clear margins',
      unit: '',
      normalRange: '',
      isAbnormal: false,
      reportedAt: '2026-03-26T16:00:00',
    },
  ],
  notes: [
    {
      id: 'note-007-a',
      author: 'Dr. Suresh Nair',
      type: 'ward-round',
      content:
        'Post-thyroidectomy Day 7. Fit for discharge today. Calcium 2.24mmol/L — stable on oral supplements. Wound healed well, no haematoma. Levothyroxine commenced. Discharge letter to include RAI ablation referral in 6–8 weeks, endocrinology follow-up at 6 weeks, and calcium monitoring instructions.',
      isAIGenerated: false,
      isApproved: true,
      createdAt: '2026-03-29T08:45:00',
    },
  ],
  amendments: [],
};
