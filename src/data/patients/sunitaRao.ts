import type { Patient } from '../../types/patient';

/**
 * Sunita Rao — Post-anterior resection Day 5
 * NEWS2: 1 — First stoma output, adjuvant chemo planned
 */
export const sunitaRao: Patient = {
  id: 'patient-006',
  status: 'active',
  name: 'Sunita Rao',
  age: 54,
  sex: 'Female',
  hospitalNumber: 'MRN-2024-006',
  location: 'Surgical Oncology Ward 3, Bed C-12',
  consultant: 'Dr. Suresh Nair',
  diagnosis: 'Carcinoma rectum pT3N1 — post-anterior resection + loop ileostomy Day 5',
  admissionDate: '2026-03-24',
  dayOfStay: 5,
  summary:
    'Post-anterior resection Day 5. First stoma output today — 320ml green liquid. Stoma nurse counselling done. pT3N1 — oncology to plan adjuvant CAPOX. Likely for discharge Day 7.',
  problems: [
    'New ileostomy — first output Day 5, stoma nursing education in progress',
    'pT3N1 — adjuvant CAPOX chemotherapy to be planned at oncology review',
    'Low mood — specialist nurse counselling arranged',
  ],
  // CLINICAL: NEWS2 = T→0 + HR→0 + SBP→0 + SpO2→1 + RR→0 + Alert→0 = 1
  vitals: {
    temperature: 37.0,
    heartRate: 78,
    systolicBP: 122,
    diastolicBP: 78,
    spO2: 95,
    respirationRate: 16,
    onSupplementalO2: false,
    spO2Scale: 1,
    consciousness: 'alert',
    recordedAt: new Date('2026-03-29T06:00:00').toISOString(),
  },
  news2Score: 1,
  medications: [
    {
      id: 'med-006-a',
      name: 'Tab. Paracetamol',
      dose: '1g',
      route: 'oral',
      frequency: 'QID',
      isActive: true,
      startDate: '2026-03-24',
    },
    {
      id: 'med-006-b',
      name: 'Tab. Diclofenac',
      dose: '50mg',
      route: 'oral',
      frequency: 'BD',
      isActive: true,
      startDate: '2026-03-25',
    },
    {
      id: 'med-006-c',
      name: 'Inj. Enoxaparin',
      dose: '40mg',
      route: 'SC',
      frequency: 'OD',
      isActive: true,
      startDate: '2026-03-24',
    },
    {
      id: 'med-006-d',
      name: 'Tab. Loperamide',
      dose: '2mg',
      route: 'oral',
      frequency: 'PRN after loose stoma output',
      isActive: true,
      startDate: '2026-03-29',
    },
  ],
  investigations: [
    {
      id: 'inv-006-a',
      testName: 'Histopathology',
      value: 'pT3N1 adenocarcinoma — 3/12 nodes positive, clear margins (CRM negative)',
      unit: '',
      normalRange: '',
      isAbnormal: false,
      reportedAt: '2026-03-28T16:00:00',
    },
    {
      id: 'inv-006-b',
      testName: 'CEA',
      value: '4.2',
      unit: 'ng/mL',
      normalRange: '<5 ng/mL',
      isAbnormal: false,
      reportedAt: '2026-03-24T09:00:00',
    },
    {
      id: 'inv-006-c',
      testName: 'Stoma Output',
      value: '320ml (green liquid)',
      unit: 'ml/day',
      normalRange: '500–2000ml/day normal ileostomy',
      isAbnormal: false,
      reportedAt: '2026-03-29T06:00:00',
    },
  ],
  notes: [
    {
      id: 'note-006-a',
      author: 'Dr. Suresh Nair',
      type: 'ward-round',
      content:
        'Post-anterior resection Day 5. First stoma function — 320ml output, appropriate for Day 5. Stoma nurse education ongoing. Final histopathology: pT3N1, CRM negative. Referral made to oncology for adjuvant CAPOX consideration. Discharge planned Day 7 with community stoma nurse follow-up.',
      isAIGenerated: false,
      isApproved: true,
      createdAt: '2026-03-29T08:30:00',
    },
  ],
  amendments: [],
};
