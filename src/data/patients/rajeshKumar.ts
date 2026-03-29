import type { Patient } from '../../types/patient';

/**
 * Rajesh Kumar — PRIMARY DEMO PATIENT
 * Post-Whipple Day 1, NEWS2: 8
 * Used for ambient scribing demonstration.
 * @clinical-note All clinical data is realistic for a post-Whipple
 * procedure patient with suspected anastomotic leak.
 */
export const rajeshKumar: Patient = {
  id: 'patient-001',
  status: 'active',
  name: 'Rajesh Kumar',
  age: 67,
  sex: 'Male',
  hospitalNumber: 'MRN-2024-001',
  location: 'Surgical Oncology Ward 3, Bed B-04',
  consultant: 'Dr. Suresh Nair',
  diagnosis: 'Carcinoma head of pancreas — post-Whipple Day 1',
  admissionDate: '2026-03-28',
  dayOfStay: 1,
  summary:
    'Post-op Day 1 Whipple. Haemodynamically borderline. Fever and drain output concerning for anastomotic leak vs. early SSI. Awaiting drain fluid amylase. CT if clinical deterioration.',
  problems: [
    'Post-Whipple Day 1 — monitoring for anastomotic leak',
    'Fever — possible early surgical site infection',
    'Tachycardia — likely pain and fever related',
    'Poor pain control — PCA morphine requirements high',
  ],
  // CLINICAL: NEWS2 = T→1 + HR→2 + SBP→2 + SpO2→1 + RR→2 + Alert→0 = 8
  vitals: {
    temperature: 38.6,
    heartRate: 114,
    systolicBP: 98,
    diastolicBP: 62,
    spO2: 95,
    respirationRate: 22,
    onSupplementalO2: false,
    spO2Scale: 1,
    consciousness: 'alert',
    recordedAt: new Date('2026-03-29T06:00:00').toISOString(),
  },
  news2Score: 8,
  medications: [
    {
      id: 'med-001-a',
      name: 'Inj. Piperacillin-Tazobactam',
      dose: '4.5g',
      route: 'IV',
      frequency: 'Q8H',
      isActive: true,
      startDate: '2026-03-29',
    },
    {
      id: 'med-001-b',
      name: 'Inj. Morphine PCA',
      dose: '1mg bolus',
      route: 'IV',
      frequency: 'PRN',
      isActive: true,
      startDate: '2026-03-28',
    },
    {
      id: 'med-001-c',
      name: 'Inj. Pantoprazole',
      dose: '40mg',
      route: 'IV',
      frequency: 'BD',
      isActive: true,
      startDate: '2026-03-28',
    },
    {
      id: 'med-001-d',
      name: 'Inj. Ondansetron',
      dose: '4mg',
      route: 'IV',
      frequency: 'Q8H',
      isActive: true,
      startDate: '2026-03-28',
    },
    {
      id: 'med-001-e',
      name: 'Inj. Enoxaparin',
      dose: '40mg',
      route: 'SC',
      frequency: 'OD',
      isActive: true,
      startDate: '2026-03-28',
    },
  ],
  investigations: [
    {
      id: 'inv-001-a',
      testName: 'Serum Amylase',
      // CLINICAL: Drain fluid amylase >5000 U/L is diagnostic of pancreatic fistula.
      // Serum amylase elevation post-Whipple raises concern for anastomotic leak.
      value: '1840',
      unit: 'U/L',
      normalRange: '30–110 U/L',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:30:00',
    },
    {
      id: 'inv-001-b',
      testName: 'CBC',
      value: 'WBC 18.4 × 10⁹/L',
      unit: '× 10⁹/L',
      normalRange: '4.0–11.0',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:30:00',
    },
    {
      id: 'inv-001-c',
      testName: 'CRP',
      value: '186',
      unit: 'mg/L',
      normalRange: '<5 mg/L',
      isAbnormal: true,
      reportedAt: '2026-03-29T06:30:00',
    },
    {
      id: 'inv-001-d',
      testName: 'Drain Fluid Amylase',
      value: 'Pending',
      unit: 'U/L',
      normalRange: '<200 U/L',
      isAbnormal: false,
      reportedAt: '2026-03-29T07:00:00',
    },
  ],
  notes: [
    {
      id: 'note-001-a',
      author: 'Dr. Suresh Nair',
      type: 'ward-round',
      content:
        'Post-op Day 1 following Whipple procedure for carcinoma head of pancreas. Febrile overnight with T-max 38.9°C. Tachycardia HR 118 at 02:00. Drain output 280ml overnight — bile-stained. IV Piperacillin-Tazobactam commenced 04:00. Awaiting drain fluid amylase and blood cultures.',
      isAIGenerated: false,
      isApproved: true,
      createdAt: '2026-03-29T07:15:00',
    },
  ],
  amendments: [],
};
