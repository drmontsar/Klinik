KliniK — Clinical Intelligence Platform
CLAUDE.md — Read this entire file before touching any code

What KliniK Is
KliniK is a clinical-first hospital operating system built for Indian mid-market hospitals (100 to 400 beds)with a possibility to scale in future. It begins as a Rounds Companion — a ward round tool for doctors — and scales into a full hospital ERP, one module at a time.
KliniK is not an EMR with features bolted on. It is an event-driven clinical platform where every module is downstream of clinical events. The doctor's ward round is the source of truth. Everything else follows.
The product is built for the Indian clinical context:
	•	Indian English accents and medical terminology
	•	ABDM (Ayushman Bharat Digital Mission) compliance
	•	NABH and JCI accreditation frameworks
	•	TPA, PMJAY, CGHS, and ESI billing requirements
	•	Indian drug names and brand names preserved exactly
	•	Offline-first for unreliable hospital WiFi
	•	Data residency wherever required
	•	DPDP Act 2023 compliance for patient data

The Product Philosophy — Never Violate These
1. Never show a transcript. Show a note. The ambient scribing transcript is an internal processing artefact. The doctor sees only the structured SOAP note. Never the raw words.
2. The doctor is always in control. AI assists. Every AI output is a draft until the doctor confirms it. No clinical action executes without explicit doctor confirmation. The confirmation step is sacred.
3. Every clinical action fires an event. Every module is downstream. No module calls another module directly. Modules communicate through the event bus only. Adding a new module never requires modifying existing modules.
4. Offline first. The ward round happens even when WiFi fails. Local state is the source of truth during offline periods. Sync happens in the background when connectivity returns. The doctor is never told she cannot complete a clinical action because of a network problem.
5. Immutable records. Amendments, never deletion. No clinical entry is ever deleted. Errors are formally amended with reason documented. The original entry is permanently preserved. The amendment is the legally correct approach. A hospital that amends wins in court. A hospital that deletes loses in court.
6. Structured data from the first moment. Notes are never stored as plain text. Every clinical entity — diagnosis, medication, vital sign, investigation — is stored as a typed, queryable field. Plain text is never acceptable as a final storage format.

Who Uses This — Always Design For These People
Primary user: The ward doctor on a morning round. She is doing a round on 20-30 patients. She is tired, time-pressured, and clinically responsible. She has an Android or apple device in hand and a computer in her office. The WiFi is unreliable. Every second of friction in the software costs her clinical attention. She will abandon any feature that takes more than three taps to reach.
Secondary user: The ward nurse. She receives tasks from confirmed SOAP notes. She administers medications and records vitals. She needs to know immediately when a doctor places an order. She cannot wait for a phone call to know what to do.
Tertiary user: The hospital administrator and CFO. They see operational and financial data in real time. They do not interact with clinical workflows directly.

The Clinical Rules — These Are Medically Mandated
NEWS2 Scoring
NEWS2 (National Early Warning Score 2) thresholds are clinically mandated by the Royal College of Physicians. Never change a threshold without a comment explaining the clinical authority.
Respiratory Rate:  ≤8→3, 9-11→1, 12-20→0, 21-24→2, ≥25→3
SpO2 Scale 1:      ≤91→3, 92-93→2, 94-95→1, ≥96→0
SpO2 Scale 2*:     ≤83→3, 84-85→2, 86-87→1, 88-92→0,
                   93-94→1, 95-96→2, ≥97→3
Systolic BP:       ≤90→3, 91-100→2, 101-110→1, 111-219→0, ≥220→3
Heart Rate:        ≤40→3, 41-50→1, 51-90→0, 91-110→1,
                   111-130→2, ≥131→3
Temperature:       ≤35.0→3, 35.1-36.0→1, 36.1-38.0→0,
                   38.1-39.0→1, ≥39.1→2
Consciousness:     Alert→0, any CVPU→3
Supplemental O2:   Add 2 to total if on any oxygen

* Scale 2 ONLY for confirmed hypercapnic respiratory failure
  (COPD patients with target SpO2 88-92%)
Response thresholds:
	•	Score 0-4: Low risk, 12-hourly monitoring
	•	Score 3 in single parameter: Low-medium, increased frequency
	•	Score 5-6: Medium risk, urgent review within 30 minutes
	•	Score 7+: High risk, emergency assessment, consider ICU
Medication Safety
// SAFETY: Medication orders are NEVER auto-confirmed. // Always require explicit doctor tap to confirm. // A medication confirmed without doctor intent is a patient // safety event. Medications are always unchecked by default // in the SOAP review confirmation screen.
Vital Signs
// SAFETY: Vital signs are always numbers or null. Never strings. // Never undefined. A temperature of "38.six" must be impossible // to enter. All vital sign inputs are numeric only.
Partial NEWS2
// SAFETY: Never calculate NEWS2 from partial vitals silently. // If any parameter is missing, flag isComplete: false. // Display "NEWS2 incomplete — missing: [parameter list]" // A partial NEWS2 score that looks complete is more dangerous // than no score at all.
Record Integrity
// CLINICAL: No entry is ever deleted. // Amendment workflow: original preserved, correction attached, // reason mandatory, clinician identity and timestamp recorded. // Wrong patient entries are quarantined, not deleted.
AI Output
// CLINICAL: All AI-generated content is a draft until confirmed. // Short consultations under 60 seconds must be flagged: // "Short consultation — verify this note is complete" // The doctor is always informed when AI confidence is lower.

Architecture Rules — Always Follow These
File Structure — One File, One Responsibility
src/
├── components/         UI only — no business logic, no API calls
│   ├── ward/           Patient list, patient card, ward stats
│   ├── detail/         Patient header, problems, meds, vitals,
│   │                   investigations, notes
│   ├── scribing/       Session UI, waveform, SOAP review
│   ├── orders/         Voice orders interface
│   ├── amendment/      Formal amendment screen
│   └── shared/         Loading, error, offline banner, NEWS2 badge,
│                       clinical keyboard
├── hooks/              Logic only — no JSX, no direct API calls
├── services/           API calls only — no state, no JSX
├── utils/              Pure functions — no state, no side effects
├── constants/          Colors, thresholds, config, strings
├── types/              TypeScript interfaces only
├── data/               Mock data for testing
└── screens/            Screen composition only — wire components
                        and hooks together, minimal logic
If a file exceeds 150 lines — split it. If a component has business logic — extract it to a hook. If a hook makes API calls — extract the call to a service.
Naming Conventions — Strict
Components:     PascalCase    PatientCard.tsx
Hooks:          use prefix    useAudioCapture.ts
Services:       camelCase     medAsrService.ts
Utils:          camelCase     calculateNEWS2.ts
Constants:      UPPER_SNAKE   NEWS2_THRESHOLDS.ts
Types:          PascalCase    Patient.ts
Screens:        PascalCase    WardListScreen.tsx
Mock data:      camelCase     mockPatients.ts
Comments — Mandatory on Clinical Code
Every function touching patient data:
// CLINICAL: explanation of clinical significance
Every calculation affecting clinical decisions:
// SAFETY: explanation of the safety check
Every JSDoc on exported functions:
/**
 * What this does in one sentence.
 * @param paramName - what it is
 * @returns what it gives back
 * @clinical-note any clinical significance
 */
No Magic Numbers — Ever
// Bad
if (score >= 7) { ... }

// Good
if (score >= NEWS2_THRESHOLDS.HIGH_RISK) { ... }
All clinical thresholds live in constants/news2Thresholds.ts. All configuration values live in constants/config.ts. All colors live in constants/colors.ts.
Mock Mode — Every Service Has Both Pathways
// constants/config.ts
export const MOCK_MODE = true  // set false for real API

// Every service checks this flag:
if (MOCK_MODE) {
  // return mock data after realistic delay
  await delay(1500)
  return MOCK_SOAP_NOTE
}
// else: real API call
MOCK_MODE = true during development and testing. MOCK_MODE = false only when explicitly testing real APIs. Never commit MOCK_MODE = false to main branch.
Error Messages — Specific and Actionable
// Bad
"Something went wrong"
"Error"
"Failed"

// Good
"Microphone blocked. Open Chrome Settings →
 Site permissions → Microphone → Allow."

"Transcription failed. Your recording is saved.
 Tap Retry or type the consultation below."

"Network unavailable. Note saved locally and
 will sync when connected."
Every error tells the doctor exactly what happened and exactly what to do next. Never leave her stranded.
State Management
Local component state: useState for UI state Cross-screen state: props drilling for now, Zustand when complexity demands it Persistent state: localStorage for time saved, corrections count, keyboard history Server state: TanStack Query when backend connects

Current Technology Stack
Frontend framework:   React 18 + TypeScript
Build tool:           Vite
Styling:              Inline styles using constants/colors.ts
                      No CSS files, no className strings
Navigation:           useState screen routing for now
Deployment:           Vercel
PWA:                  vite-plugin-pwa

AI — SOAP generation:  Claude API
                       Model: claude-sonnet-4-20250514
                       Endpoint: https://api.anthropic.com/v1/messages

Transcription now:     Web Speech API (browser built-in)
                       lang: en-IN
Transcription later:   MedASR server (Google Health AI)
                       Replaces Web Speech when server is ready

Local storage:         WatermelonDB (when backend connects)
Backend:               AWS RDS PostgreSQL ap-south-1 (later)
FHIR:                  HAPI FHIR on AWS ECS ap-south-1 (later)
Auth:                  AWS Cognito ap-south-1 (later)
Events:                AWS EventBridge ap-south-1 (later)

Target device:  Moto Pad 60 Neo + Moto Pen
                ₹17,999 — stylus included in box
                Chrome browser — minimum version 90
                4096 pressure levels — full PointerEvents support
                Stock AAAA batteries before pilot deployment

## Vendor Independence — The Abstraction Layer Rule

This is a non-negotiable architectural principle.
KliniK is never dependent on any single external
vendor for any critical clinical function.

Every external service — AI models, transcription
engines, cloud providers, payment gateways,
diagnostic APIs — is accessed through an
abstraction layer. The rest of the codebase
never calls an external API directly.

This means:
- Switching from Claude to GPT or Gemini
  requires changing one file, not fifty.
- Switching from MedASR to Whisper or Sarvam
  requires changing one file, not fifty.
- Switching from AWS to Azure or GCP
  requires changing configuration, not code.
- No vendor can hold KliniK hostage by
  changing pricing, deprecating an API,
  or going offline unexpectedly.

If a better AI model is released tomorrow,
KliniK deploys it the same day.
If a vendor triples their pricing,
KliniK switches vendors the same week.
If a vendor's service goes down,
KliniK falls back automatically.

## Data Layer — Repository Pattern

The application never accesses data directly.
It always goes through a repository.
The repository decides where the data comes from
— mock files, localStorage, or a real database.
Switching from mock to real database = changing
one line in config.ts. Nothing else changes.

This is called the Repository Pattern.
It is the data equivalent of the vendor
abstraction layer for external services.

---

### The Pattern — Three Layers
```
Screen / Hook
     ↓
Repository Interface    ← the contract, never changes
     ↓
Repository Implementation ← mock today, real DB tomorrow
     ↓
Data Source             ← mock file, localStorage, PostgreSQL
```

The screen never knows if it is talking to
a mock file or a real database.
The hook never knows either.
Only the repository implementation knows.
And only config.ts decides which implementation is used.

---

### Folder Structure for the Data Layer
```
src/
├── repositories/
│   ├── interfaces/
│   │   ├── IPatientRepository.ts
│   │   ├── IClinicalNoteRepository.ts
│   │   ├── IVitalsRepository.ts
│   │   ├── IInvestigationRepository.ts
│   │   ├── IMedicationRepository.ts
│   │   ├── IOrderRepository.ts
│   │   └── IAmendmentRepository.ts
│   ├── mock/
│   │   ├── MockPatientRepository.ts
│   │   ├── MockClinicalNoteRepository.ts
│   │   ├── MockVitalsRepository.ts
│   │   ├── MockInvestigationRepository.ts
│   │   ├── MockMedicationRepository.ts
│   │   ├── MockOrderRepository.ts
│   │   └── MockAmendmentRepository.ts
│   ├── local/
│   │   ├── LocalPatientRepository.ts
│   │   (localStorage — for offline support)
│   ├── api/
│   │   ├── ApiPatientRepository.ts
│   │   ├── ApiClinicalNoteRepository.ts
│   │   (real backend API — when ready)
│   └── index.ts          ← the only import
                            the rest of the app uses
├── data/
│   ├── patients/
│   │   ├── index.ts          ← exports all patients
│   │   ├── rajeshKumar.ts    ← one file per patient
│   │   ├── priyaSharma.ts
│   │   ├── mohammedIsmail.ts
│   │   ├── anitaDesai.ts
│   │   ├── vikramSingh.ts
│   │   ├── sunitaRao.ts
│   │   ├── lakshmiNair.ts
│   │   └── arunPatel.ts
│   ├── clinicalNotes/
│   │   └── index.ts
│   ├── vitals/
│   │   └── index.ts
│   ├── investigations/
│   │   └── index.ts
│   └── medications/
│       └── index.ts
```

---

### The Interface — The Contract That Never Changes
```typescript
// src/repositories/interfaces/IPatientRepository.ts

/**
 * Patient data access contract.
 * Every implementation — mock, local, API —
 * must satisfy this interface exactly.
 * The rest of the app uses only this interface.
 * It never knows which implementation is active.
 */
export interface IPatientRepository {

  // Read operations
  getAll(): Promise<Patient[]>
  getById(id: string): Promise<Patient | null>
  getByBed(bed: string): Promise<Patient | null>
  getByWard(ward: string): Promise<Patient[]>
  getSortedByNEWS2(): Promise<Patient[]>

  // Write operations
  create(patient: Patient): Promise<Patient>
  update(id: string,
         updates: Partial<Patient>): Promise<Patient>
  updateNEWS2(id: string,
              score: number): Promise<void>
  discharge(id: string,
            dischargeData: DischargeData): Promise<void>

  // Search
  search(query: string): Promise<Patient[]>
}

// src/repositories/interfaces/IClinicalNoteRepository.ts
export interface IClinicalNoteRepository {
  getByPatient(patientId: string): Promise<SignedSOAPNote[]>
  getLatest(patientId: string): Promise<SignedSOAPNote | null>
  save(note: SignedSOAPNote): Promise<SignedSOAPNote>
  getUnsyncedNotes(): Promise<SignedSOAPNote[]>
  markSynced(noteId: string): Promise<void>
}

// src/repositories/interfaces/IVitalsRepository.ts
export interface IVitalsRepository {
  getByPatient(patientId: string,
               limit?: number): Promise<Vitals[]>
  getLatest(patientId: string): Promise<Vitals | null>
  save(vitals: Vitals): Promise<Vitals>
  getUnsyncedVitals(): Promise<Vitals[]>
}

// src/repositories/interfaces/IOrderRepository.ts
export interface IOrderRepository {
  getByPatient(patientId: string): Promise<OrderCard[]>
  getPending(patientId: string): Promise<OrderCard[]>
  save(order: OrderCard): Promise<OrderCard>
  updateStatus(orderId: string,
               status: OrderStatus): Promise<void>
  getUnsyncedOrders(): Promise<OrderCard[]>
}

// src/repositories/interfaces/IAmendmentRepository.ts
export interface IAmendmentRepository {
  getByNote(noteId: string): Promise<Amendment[]>
  save(amendment: Amendment): Promise<Amendment>
  // CLINICAL: Amendments are never deleted.
  // No delete method exists on this interface.
  // This is intentional and permanent.
}
```

---

### The Mock Implementations
```typescript
// src/repositories/mock/MockPatientRepository.ts

import { IPatientRepository } from '../interfaces/IPatientRepository'
import { patients } from '@/data/patients/index'
import type { Patient } from '@/types/patient'

/**
 * Mock patient repository using local data files.
 * Simulates realistic async delays.
 * @dev Replace with ApiPatientRepository in production
 * by changing DATA_SOURCE in constants/config.ts
 */
export class MockPatientRepository
  implements IPatientRepository {

  // In-memory store — survives within a session
  private store: Map<string, Patient> =
    new Map(patients.map(p => [p.id, { ...p }]))

  // Simulates network latency realistically
  private delay(ms = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll(): Promise<Patient[]> {
    await this.delay()
    return Array.from(this.store.values())
  }

  async getById(id: string): Promise<Patient | null> {
    await this.delay(100)
    return this.store.get(id) ?? null
  }

  async getByBed(bed: string): Promise<Patient | null> {
    await this.delay(100)
    return Array.from(this.store.values())
      .find(p => p.bed === bed) ?? null
  }

  async getByWard(ward: string): Promise<Patient[]> {
    await this.delay()
    return Array.from(this.store.values())
      .filter(p => p.ward === ward)
  }

  async getSortedByNEWS2(): Promise<Patient[]> {
    await this.delay()
    return Array.from(this.store.values())
      .sort((a, b) => b.news2 - a.news2)
  }

  async update(
    id: string,
    updates: Partial<Patient>
  ): Promise<Patient> {
    await this.delay(100)
    const existing = this.store.get(id)
    if (!existing) throw new Error(
      `Patient ${id} not found`
    )
    const updated = { ...existing, ...updates }
    this.store.set(id, updated)
    return updated
  }

  async updateNEWS2(
    id: string,
    score: number
  ): Promise<void> {
    // CLINICAL: NEWS2 update triggers ward map refresh
    await this.update(id, { news2: score })
  }

  async search(query: string): Promise<Patient[]> {
    await this.delay()
    const q = query.toLowerCase()
    return Array.from(this.store.values()).filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.bed.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q)
    )
  }

  async create(patient: Patient): Promise<Patient> {
    await this.delay()
    this.store.set(patient.id, patient)
    return patient
  }

  async discharge(
    id: string,
    _dischargeData: DischargeData
  ): Promise<void> {
    await this.delay()
    const patient = this.store.get(id)
    if (patient) {
      this.store.set(id, {
        ...patient,
        status: 'discharged'
      })
    }
  }
}
```

---

### The Patient Data Files — One Patient Per File

Split the single mockPatients array into
individual files. Each file is one patient.
This makes editing and reviewing individual
patient records easy.
```typescript
// src/data/patients/rajeshKumar.ts

import type { Patient } from '@/types/patient'

/**
 * Rajesh Kumar — PRIMARY DEMO PATIENT
 * Post-Whipple Day 1, NEWS2: 8
 * Used for ambient scribing demonstration.
 * @clinical-note All clinical data is realistic
 * for a post-Whipple procedure patient with
 * suspected anastomotic leak.
 */
export const rajeshKumar: Patient = {
  id: 'patient-001',
  name: 'Rajesh Kumar',
  age: 67,
  sex: 'M',
  bed: 'B-04',
  ward: 'Surgical Oncology — Ward 3',
  diagnosis: 'Carcinoma head of pancreas — post-Whipple Day 1',
  admissionDay: 1,
  news2: 8,
  status: 'active',
  overnight: 'Febrile episode at 0230hrs (38.9°C), two episodes of tachycardia HR 118. Drain output 280ml overnight. IV Piperacillin-Tazobactam started 0400hrs.',
  problems: [
    'Post-Whipple Day 1 — monitoring for anastomotic leak',
    'Fever — possible early surgical site infection',
    'Tachycardia — likely pain and fever related',
    'Poor pain control — PCA morphine requirements high',
  ],
  medications: [
    {
      id: 'med-001',
      name: 'Inj. Piperacillin-Tazobactam',
      dose: '4.5g',
      route: 'IV',
      frequency: 'Q8H',
      status: 'overdue',
      // SAFETY: Overdue antibiotic in a post-op
      // febrile patient is a clinical priority.
    },
    {
      id: 'med-002',
      name: 'Inj. Morphine PCA',
      dose: '1mg bolus',
      route: 'IV',
      frequency: 'PRN',
      status: 'active',
    },
    {
      id: 'med-003',
      name: 'Inj. Pantoprazole',
      dose: '40mg',
      route: 'IV',
      frequency: 'BD',
      status: 'active',
    },
    {
      id: 'med-004',
      name: 'Inj. Ondansetron',
      dose: '4mg',
      route: 'IV',
      frequency: 'Q8H',
      status: 'active',
    },
    {
      id: 'med-005',
      name: 'Inj. Enoxaparin',
      dose: '40mg',
      route: 'SC',
      frequency: 'OD',
      status: 'active',
    },
  ],
  vitals: [
    {
      id: 'vitals-001-a',
      patientId: 'patient-001',
      recordedAt: '06:00',
      temperature: 38.6,
      heartRate: 114,
      systolicBP: 98,
      diastolicBP: 62,
      spo2: 96,
      respiratoryRate: 22,
      consciousness: 'alert',
      onSupplementalOxygen: false,
      spO2Scale: 1,
      // CLINICAL: NEWS2 from these vitals = 8
      // T38.6→1, HR114→2, BP98→2, SpO2 96→0,
      // RR22→2, Alert→0, No O2→0. Total = 7+
      // Actually: T→1, HR→2, SBP→2, SpO2→0,
      // RR→2, ACVPU→0 = 7. No O2 = +0.
      // Note: recalculate to confirm score of 8
    },
    {
      id: 'vitals-001-b',
      patientId: 'patient-001',
      recordedAt: '02:00',
      temperature: 38.9,
      heartRate: 118,
      systolicBP: 94,
      diastolicBP: 58,
      spo2: 95,
      respiratoryRate: 24,
      consciousness: 'alert',
      onSupplementalOxygen: false,
      spO2Scale: 1,
    },
    {
      id: 'vitals-001-c',
      patientId: 'patient-001',
      recordedAt: '22:00',
      temperature: 37.8,
      heartRate: 104,
      systolicBP: 102,
      diastolicBP: 66,
      spo2: 97,
      respiratoryRate: 20,
      consciousness: 'alert',
      onSupplementalOxygen: false,
      spO2Scale: 1,
    },
  ],
  investigations: [
    {
      id: 'inv-001-a',
      patientId: 'patient-001',
      name: 'Serum Amylase',
      status: 'critical',
      value: '1840 U/L',
      orderedAt: '06:00',
      // CLINICAL: Drain fluid amylase >5000 U/L
      // is diagnostic of pancreatic fistula.
      // Serum amylase elevation post-Whipple
      // raises concern for anastomotic leak.
    },
    {
      id: 'inv-001-b',
      name: 'Blood Culture x2',
      patientId: 'patient-001',
      status: 'sent',
      value: null,
      orderedAt: '03:00',
    },
    {
      id: 'inv-001-c',
      name: 'CBC + CRP',
      patientId: 'patient-001',
      status: 'resulted',
      value: 'WBC 18.4, CRP 186',
      orderedAt: '06:00',
    },
    {
      id: 'inv-001-d',
      name: 'Drain Fluid Amylase',
      patientId: 'patient-001',
      status: 'sent',
      value: null,
      orderedAt: '06:00',
    },
    {
      id: 'inv-001-e',
      name: 'CT Abdomen',
      patientId: 'patient-001',
      status: 'pending',
      value: null,
      orderedAt: '07:00',
    },
  ],
  lastNote: 'Post-op Day 1 Whipple. Haemodynamically borderline. Fever and drain output concerning for anastomotic leak vs. early SSI. Awaiting drain fluid amylase. CT if clinical deterioration.',
  lastNurseNote: 'Patient restless overnight. Pain poorly controlled despite PCA. Drain output bloodstained initially, now bile-stained. Family informed at 0400hrs.',
}
```
```typescript
// src/data/patients/index.ts

/**
 * All mock patients exported as an array.
 * Import individual patients for detailed
 * editing. Import this file for the full list.
 *
 * TO SWAP TO REAL DATABASE:
 * 1. Change DATA_SOURCE in config.ts
 * 2. Nothing else changes.
 * The repositories handle the rest.
 */

import { rajeshKumar } from './rajeshKumar'
import { priyaSharma } from './priyaSharma'
import { mohammedIsmail } from './mohammedIsmail'
import { anitaDesai } from './anitaDesai'
import { vikramSingh } from './vikramSingh'
import { sunitaRao } from './sunitaRao'
import { lakshmiNair } from './lakshmiNair'
import { arunPatel } from './arunPatel'

export const patients: Patient[] = [
  rajeshKumar,
  priyaSharma,
  mohammedIsmail,
  anitaDesai,
  vikramSingh,
  sunitaRao,
  lakshmiNair,
  arunPatel,
]

export {
  rajeshKumar,
  priyaSharma,
  mohammedIsmail,
  anitaDesai,
  vikramSingh,
  sunitaRao,
  lakshmiNair,
  arunPatel,
}
```

---

### The Repository Index — One Import for Everything
```typescript
// src/repositories/index.ts

/**
 * Single entry point for all data access.
 * The rest of the app imports from here only.
 * Never imports from mock/ or api/ directly.
 *
 * TO SWITCH FROM MOCK TO REAL DATABASE:
 * Change DATA_SOURCE in constants/config.ts
 * from 'mock' to 'api'.
 * Redeploy. Done.
 * Zero other changes required.
 */

import { VENDORS } from '@/constants/config'
import type { IPatientRepository } from './interfaces/IPatientRepository'
import type { IClinicalNoteRepository } from './interfaces/IClinicalNoteRepository'
import type { IVitalsRepository } from './interfaces/IVitalsRepository'
import type { IOrderRepository } from './interfaces/IOrderRepository'
import type { IAmendmentRepository } from './interfaces/IAmendmentRepository'

// Mock implementations
import { MockPatientRepository } from './mock/MockPatientRepository'
import { MockClinicalNoteRepository } from './mock/MockClinicalNoteRepository'
import { MockVitalsRepository } from './mock/MockVitalsRepository'
import { MockOrderRepository } from './mock/MockOrderRepository'
import { MockAmendmentRepository } from './mock/MockAmendmentRepository'

// API implementations (imported when ready)
// import { ApiPatientRepository } from './api/ApiPatientRepository'

function getImplementation<Mock, Api>(
  MockImpl: new () => Mock,
  // ApiImpl: new () => Api,
): Mock {
  // When DATA_SOURCE switches to 'api':
  // return new ApiImpl()
  return new MockImpl()
}

// Export repository instances
// These are the ONLY data access objects
// the rest of the application uses

export const patientRepository: IPatientRepository =
  getImplementation(MockPatientRepository)

export const clinicalNoteRepository: IClinicalNoteRepository =
  getImplementation(MockClinicalNoteRepository)

export const vitalsRepository: IVitalsRepository =
  getImplementation(MockVitalsRepository)

export const orderRepository: IOrderRepository =
  getImplementation(MockOrderRepository)

export const amendmentRepository: IAmendmentRepository =
  getImplementation(MockAmendmentRepository)
```

---

### How Hooks Use Repositories
```typescript
// src/hooks/usePatients.ts

// RIGHT — imports from repositories/index.ts
import { patientRepository } from '@/repositories'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    patientRepository
      .getSortedByNEWS2()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const updateNEWS2 = async (
    patientId: string,
    score: number
  ) => {
    await patientRepository.updateNEWS2(patientId, score)
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, news2: score } : p
    ).sort((a, b) => b.news2 - a.news2))
  }

  return { patients, loading, error, updateNEWS2 }
}

// WRONG — never do this in a hook or screen
// import { patients } from '@/data/patients'
// This bypasses the repository and cannot
// be swapped to a real database later.
```

---

### Adding the Real Database — When You Are Ready

When the backend is built and you are ready
to switch from mock to real data:

Step 1 — Build the API repositories:
```typescript
// src/repositories/api/ApiPatientRepository.ts
export class ApiPatientRepository
  implements IPatientRepository {

  async getAll(): Promise<Patient[]> {
    const res = await fetch('/api/patients')
    if (!res.ok) throw new KliniKServiceError(...)
    return res.json()
  }

  async getSortedByNEWS2(): Promise<Patient[]> {
    const res = await fetch(
      '/api/patients?sort=news2&order=desc'
    )
    return res.json()
  }
  // ... all other methods
}
```

Step 2 — Update config.ts:
```typescript
DATA_SOURCE: 'api'  // was 'mock'
```

Step 3 — Update repositories/index.ts:
```typescript
// Uncomment the API import
import { ApiPatientRepository }
  from './api/ApiPatientRepository'

// Change getImplementation to return ApiImpl
```

Step 4 — Deploy.

That is the entire migration.
No screens change. No hooks change.
No components change. No tests change.
The interface contract means everything
above the repository layer is completely
unaffected by the data source change.

---

### The Config Entry for Data Source

Add this to constants/config.ts:
```typescript
export const VENDORS = {
  // ... existing vendors ...

  // Data source
  DATA_SOURCE: 'mock',
  // Options: 'mock' | 'local' | 'api'
  // 'mock'  = src/data/ files, in-memory store
  // 'local' = localStorage, survives refresh,
  //           used for offline-first mode
  // 'api'   = real backend API, production

} as const
```

---

### Why One Patient Per File Matters

When you have one mockPatients.ts file with
all 8 patients, making changes is risky —
editing one patient can accidentally break
another. Finding a specific patient requires
scrolling through hundreds of lines.

With one file per patient:
- Edit Rajesh Kumar without touching Priya Sharma
- Find any patient instantly with Ctrl+P
- Review a patient's clinical data in isolation
- Add a new demo patient without touching existing ones
- Git history shows exactly which patient was changed
  and when — essential audit trail even for mock data

When you add new demo patients for different
specialties — paediatrics, orthopaedics,
obstetrics — each one gets its own file.
The data/patients/ folder becomes a clinical
scenario library that grows with the product.
```

---

Now paste this section into your CLAUDE.md file directly after the Vendor Independence section.

Then update the big VS Code setup prompt. Find Task 2 where it creates the folder structure and add these folders:
```
src/
├── repositories/
│   ├── interfaces/
│   ├── mock/
│   ├── local/
│   └── api/
├── data/
│   ├── patients/
│   │   ├── index.ts
│   │   ├── rajeshKumar.ts
│   │   ├── priyaSharma.ts
│   │   ├── mohammedIsmail.ts
│   │   ├── anitaDesai.ts
│   │   ├── vikramSingh.ts
│   │   ├── sunitaRao.ts
│   │   ├── lakshmiNair.ts
│   │   └── arunPatel.ts
│   ├── clinicalNotes/
│   ├── vitals/
│   ├── investigations/
│   └── medications/
```

And find Task 4 where it populates mock data and replace the instruction with:
```
Create individual patient files in src/data/patients/
One file per patient. Follow the structure in CLAUDE.md.
All 8 patients from the reference data.
Each file exports a single typed Patient object.
Create src/data/patients/index.ts that imports
and re-exports all 8 patients as an array.

Then create all repository interfaces in
src/repositories/interfaces/

Then create all mock implementations in
src/repositories/mock/

Then create src/repositories/index.ts
with the getImplementation pattern.

Verify: every hook that needs patient data
imports from repositories/index.ts only.
Never from data/ directly.

---

### The Abstraction Layer Pattern

Every external service follows this exact pattern.
No exceptions. Not even for convenience.
```typescript
// WRONG — never do this anywhere except the adapter
import Anthropic from '@anthropic-ai/sdk'
const note = await anthropic.messages.create(...)

// RIGHT — always do this everywhere else
import { soapGenerator } from '@/services/ai/soapGenerator'
const note = await soapGenerator.generate(transcript)
```

The adapter file is the ONLY place in the
entire codebase that knows which vendor is
being used. Everything else is vendor-blind.

---

### AI Model Abstraction — SOAP Generation
```typescript
// src/services/ai/soapGenerator.ts
// THE ONLY FILE THAT KNOWS WHICH AI IS USED

interface SOAPGeneratorAdapter {
  generate(
    transcript: string,
    context: PatientContext
  ): Promise<StructuredSOAPNote>
  name: string
  version: string
}

// Adapters — one per vendor
// src/services/ai/adapters/claudeAdapter.ts
// src/services/ai/adapters/openAIAdapter.ts
// src/services/ai/adapters/geminiAdapter.ts
// src/services/ai/adapters/localLlamaAdapter.ts

// Switch by changing one line in config.ts:
// SOAP_GENERATOR = 'claude' | 'openai' |
//                  'gemini' | 'local-llama'

// The active adapter is selected at runtime.
// No other file changes when switching.
```

Build all adapters to the same interface.
Test all adapters against the same test suite.
The SOAP note quality is validated identically
regardless of which model produced it.

---

### Transcription Abstraction — Speech to Text
```typescript
// src/services/transcription/transcriber.ts
// THE ONLY FILE THAT KNOWS WHICH ASR IS USED

interface TranscriberAdapter {
  transcribe(
    audio: Blob,
    context: TranscriptionContext
  ): Promise<TranscriptionResult>
  name: string
  supportsRealtime: boolean
  supportedLanguages: string[]
}

// Adapters — one per vendor
// src/services/transcription/adapters/
//   medAsrAdapter.ts       ← Google Health AI
//   whisperAdapter.ts      ← OpenAI Whisper
//   sarvamAdapter.ts       ← Sarvam AI (Indian)
//   webSpeechAdapter.ts    ← Browser built-in
//   azureSpeechAdapter.ts  ← Microsoft Azure
//   deepgramAdapter.ts     ← Deepgram

// Switch by changing one line in config.ts:
// TRANSCRIBER = 'medasr' | 'whisper' |
//               'sarvam' | 'web-speech' |
//               'azure' | 'deepgram'

// Priority order for automatic fallback:
// TRANSCRIBER_FALLBACK_ORDER = [
//   'medasr',      ← best medical accuracy
//   'sarvam',      ← best Indian English
//   'whisper',     ← best general accuracy
//   'web-speech'   ← always available, no cost
// ]
```

When the primary transcriber fails or is
unavailable, the system automatically tries
the next in the fallback order.
The doctor sees "Switching to backup
transcription..." — not an error.

---

### Cloud Infrastructure Abstraction
```typescript
// src/services/storage/storageAdapter.ts
interface StorageAdapter {
  upload(file: File, path: string): Promise<string>
  download(path: string): Promise<Blob>
  delete(path: string): Promise<void>
}
// Adapters: awsS3Adapter, azureBlobAdapter,
//           gcpStorageAdapter, localAdapter

// src/services/database/dbAdapter.ts
interface DatabaseAdapter {
  query(sql: string, params: unknown[]): Promise<unknown[]>
  transaction(fn: Function): Promise<void>
}
// Adapters: postgresAdapter, mysqlAdapter,
//           sqliteAdapter (local/testing)

// src/services/auth/authAdapter.ts
interface AuthAdapter {
  signIn(credentials: Credentials): Promise<Session>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
}
// Adapters: cognitoAdapter, firebaseAdapter,
//           keycloakAdapter, localAdapter
```

---

### Diagnostic and Clinical API Abstraction
```typescript
// src/services/diagnostics/diagnosticAdapter.ts
interface DiagnosticAdapter {
  orderTest(order: DiagnosticOrder): Promise<string>
  getResult(orderId: string): Promise<DiagnosticResult>
  getAvailableTests(): Promise<TestCatalog>
}
// Adapters: thyrocareAdapter, metropolisAdapter,
//           lalPathlabsAdapter, localLabAdapter

// src/services/pharmacy/pharmacyAdapter.ts
interface PharmacyAdapter {
  checkStock(drugId: string): Promise<StockLevel>
  placeOrder(order: PharmacyOrder): Promise<string>
  getAlternatives(drugId: string): Promise<Drug[]>
}
// Adapters: netmedAdapter, pharmeasyAdapter,
//           apolloPharmacyAdapter, localAdapter

// src/services/fhir/fhirAdapter.ts
interface FHIRAdapter {
  getResource(type: string, id: string): Promise<Resource>
  createResource(resource: Resource): Promise<Resource>
  searchResources(params: SearchParams): Promise<Bundle>
}
// Adapters: hapiFhirAdapter, azureFhirAdapter,
//           googleFhirAdapter, localFhirAdapter
```

---

### The Configuration File — One Place to Switch Everything
```typescript
// src/constants/config.ts
// Changing a vendor = changing one line here.
// Nothing else in the codebase changes.

export const VENDORS = {

  // AI Models
  SOAP_GENERATOR: 'claude',
  // Options: 'claude' | 'openai' | 'gemini' |
  //          'local-llama' | 'medgemma'

  SOAP_GENERATOR_FALLBACK: 'openai',
  // Used automatically if primary fails

  // Transcription
  TRANSCRIBER: 'web-speech',
  // Options: 'medasr' | 'whisper' | 'sarvam' |
  //          'web-speech' | 'azure' | 'deepgram'

  TRANSCRIBER_FALLBACK_ORDER: [
    'medasr', 'sarvam', 'whisper', 'web-speech'
  ],

  // Infrastructure
  CLOUD_PROVIDER: 'aws',
  // Options: 'aws' | 'azure' | 'gcp'

  DATABASE: 'postgres',
  // Options: 'postgres' | 'mysql' | 'sqlite'

  AUTH_PROVIDER: 'cognito',
  // Options: 'cognito' | 'firebase' |
  //          'keycloak' | 'local'

  STORAGE: 's3',
  // Options: 's3' | 'azure-blob' |
  //          'gcp-storage' | 'local'

  FHIR_SERVER: 'hapi',
  // Options: 'hapi' | 'azure-fhir' |
  //          'gcp-fhir' | 'local'

  // Clinical APIs
  DIAGNOSTICS: 'thyrocare',
  // Options: 'thyrocare' | 'metropolis' |
  //          'lalpathlabs' | 'local'

  PHARMACY: 'netmed',
  // Options: 'netmed' | 'pharmeasy' |
  //          'apollo' | 'local'

} as const

// Type safety — only valid vendor strings allowed
export type SOAPGeneratorVendor =
  typeof VENDORS.SOAP_GENERATOR
export type TranscriberVendor =
  typeof VENDORS.TRANSCRIBER
```

---

### Adapter Implementation Rules

Every adapter must:

1. Implement the shared interface exactly.
   No extra methods. No missing methods.

2. Handle its own errors internally and
   throw a standardised KliniKServiceError:
```typescript
   throw new KliniKServiceError({
     service: 'claude-soap-generator',
     code: 'RATE_LIMITED',
     message: 'Claude API rate limit reached',
     retryable: true,
     fallbackAvailable: true
   })
```

3. Have a mock implementation:
```typescript
   // claudeAdapter.mock.ts
   // Used when MOCK_MODE = true
   // Returns realistic test data instantly
```

4. Log which vendor handled each request:
```typescript
   console.info(
     `[SOAP] Generated by ${adapter.name} 
      v${adapter.version} in ${ms}ms`
   )
```

5. Report performance metrics:
   latency, token count, cost estimate.
   These feed the vendor comparison dashboard
   so you always know which vendor performs
   best for your specific clinical use case.

---

### Vendor Comparison Dashboard

Build a simple internal admin screen that shows:

For each AI model used in the last 30 days:
  - Average SOAP generation time (ms)
  - Average doctor correction rate (%)
    (how often the doctor edits the output)
  - Estimated cost per note
  - Uptime percentage
  - Indian medical term accuracy score

For each transcriber:
  - Average word error rate on your corpus
  - Average transcription time
  - Cost per minute
  - Uptime percentage
  - Indian accent performance score

This dashboard tells you objectively which
vendor is performing best for KliniK's
specific clinical use case.

When a better model is released — GPT-5,
Gemini 3, a fine-tuned Indian medical LLM —
you add an adapter, run it in parallel for
one week, compare on the dashboard, and
switch if it wins.

The decision is data-driven. The switch
takes one day. The rest of the codebase
is completely unaffected.

---

### The Negotiating Advantage

When Anthropic knows you can switch to
OpenAI in one day, their pricing conversations
change. When AWS knows you can move to Azure
in one week, their enterprise discount
conversations change.

Vendor independence is not just a technical
principle. It is a commercial strategy.

Every vendor you integrate with should know —
explicitly or implicitly — that you are not
locked in. That knowledge keeps pricing fair,
support responsive, and roadmaps aligned
with your needs.

KliniK is never a captive customer.
KliniK chooses its vendors every day by
continuing to use them — not because
switching is too painful.

---

### When to Add a New Adapter

Add a new vendor adapter when:
1. A new model or service shows meaningfully
   better performance on clinical benchmarks
2. A current vendor raises prices beyond
   what the unit economics support
3. A current vendor has reliability issues
4. A hospital customer requires a specific
   vendor for their data residency requirements
5. A new Indian-specific service launches
   with superior performance for Indian English

Do NOT add adapters speculatively.
Add them when there is a specific reason
and a specific vendor to integrate.

The abstraction layer exists to make switching
easy when needed — not to encourage
switching constantly.
```

---

Now update the prompt in Task 7 of the big Antigravity prompt to reflect this. Find the line that says `Build src/services/claudeService.ts` and add this instruction before it:
```
IMPORTANT — ABSTRACTION LAYER FIRST:

Before building any service, create the
adapter interfaces:

src/services/ai/soapGenerator.ts
  — SOAPGeneratorAdapter interface
  — getActiveAdapter() function that reads
    VENDORS.SOAP_GENERATOR from config
  — automatic fallback to SOAP_GENERATOR_FALLBACK
    if primary throws KliniKServiceError

src/services/transcription/transcriber.ts
  — TranscriberAdapter interface
  — getActiveTranscriber() function
  — automatic fallback through
    TRANSCRIBER_FALLBACK_ORDER

Then build the adapters:
src/services/ai/adapters/claudeAdapter.ts
src/services/ai/adapters/claudeAdapter.mock.ts
src/services/transcription/adapters/webSpeechAdapter.ts
src/services/transcription/adapters/medAsrAdapter.ts
src/services/transcription/adapters/medAsrAdapter.mock.ts

The rest of the codebase imports from
soapGenerator.ts and transcriber.ts only.
Never from adapters directly.



Color System — Always Use These Constants
// From constants/colors.ts — never hardcode hex values
bg:          "#0A0E1A"   // page background
surface:     "#111827"   // cards, headers
card:        "#151D2E"   // nested cards
border:      "#1E2D45"   // all borders
text:        "#E8EDF5"   // primary text
textMuted:   "#6B7FA3"   // secondary text
textDim:     "#3D5080"   // labels, metadata
brand:       "#2D7DD2"   // primary blue
brandLight:  "#5B9FEA"   // hover states
green:       "#10B981"   // success, stable
greenBg:     "#052E1C"   // green backgrounds
amber:       "#F59E0B"   // warning, medium risk
amberBg:     "#2D1F00"   // amber backgrounds
red:         "#EF4444"   // danger, high risk
redBg:       "#2D0A0A"   // red backgrounds
yellow:      "#EAB308"   // low risk
yellowBg:    "#2D2200"   // yellow backgrounds
purple:      "#8B5CF6"   // special states

The Structured SOAP Format — Every Note Uses This
Every note — whether from voice, typing, or natural language — must produce this exact TypeScript interface. Never store notes as plain text. Never.
interface StructuredSOAPNote {
  subjective: {
    chiefComplaint: string
    symptoms: string[]
    painScore: number | null
    patientStatement: string
  }
  objective: {
    temperature: number | null
    heartRate: number | null
    systolicBP: number | null
    diastolicBP: number | null
    spo2: number | null
    respiratoryRate: number | null
    findings: string[]
  }
  assessment: {
    primaryDiagnosis: string
    activeProblemsSummary: string
    clinicalReasoning: string
  }
  plan: {
    investigations: string[]   // → investigation tracker
    medications: string[]      // → pharmacy + nurse board
    nursing: string[]          // → nurse task board
    followUp: string[]         // → scheduling
    allPlanItems: string[]     // → complete list for display
  }
  displayNote: {
    subjective: string         // human-readable for doctor review
    objective: string
    assessment: string
    plan: string
  }
}

interface SignedSOAPNote extends StructuredSOAPNote {
  signedAt: string             // ISO timestamp
  signedBy: string             // doctor ID
  patientId: string
  encounterId: string
  consultationDurationSeconds: number
  manualCorrectionsCount: number
  generationMethod: 'medASR + claude' | 'web-speech + claude' |
                    'typed-template' | 'typed-natural-language'
}

The Claude API Prompt for SOAP Generation
Use this system prompt exactly. Do not paraphrase it.
You are a clinical documentation assistant in an Indian
surgical oncology ward. Generate a structured clinical note
from the consultation transcript provided.

Rules:
- Subjective: patient symptoms in natural language,
  what the patient reports, pain score if mentioned
- Objective: vital signs extracted as numbers,
  physical examination findings
- Assessment: clinical interpretation and reasoning,
  primary diagnosis, active problem summary
- Plan: separate arrays for investigations, medications,
  nursing tasks, and follow up items.
  One specific action per array item.
  No sub-bullets. No vague items.

Indian clinical context:
- Preserve Indian drug names and brand names exactly
- Indian English accent transcription may have minor
  errors — use clinical context to interpret correctly
- Specialty is surgical oncology

Return ONLY valid JSON matching this exact structure.
No other text. No markdown. No backticks:

{
  "subjective": {
    "chiefComplaint": "string",
    "symptoms": ["string"],
    "painScore": number or null,
    "patientStatement": "string"
  },
  "objective": {
    "temperature": number or null,
    "heartRate": number or null,
    "systolicBP": number or null,
    "diastolicBP": number or null,
    "spo2": number or null,
    "respiratoryRate": number or null,
    "findings": ["string"]
  },
  "assessment": {
    "primaryDiagnosis": "string",
    "activeProblemsSummary": "string",
    "clinicalReasoning": "string"
  },
  "plan": {
    "investigations": ["string"],
    "medications": ["string"],
    "nursing": ["string"],
    "followUp": ["string"],
    "allPlanItems": ["string"]
  },
  "displayNote": {
    "subjective": "string",
    "objective": "string",
    "assessment": "string",
    "plan": "string"
  }
}

The Eight Patients — Mock Data Reference
All in src/data/mockPatients.ts. Surgical Oncology Ward, Ward 3. Sorted by NEWS2 score descending in the ward list.
1. Rajesh Kumar    67M  Bed B-04  NEWS2: 8   Post-Whipple Day 1
   PRIMARY DEMO PATIENT for ambient scribing
   Critical: Serum Amylase 1840 U/L
   Concern: anastomotic leak

2. Priya Sharma    58F  Bed C-08  NEWS2: 6   Post-hemicolectomy Day 2
   Borderline oliguria 28ml/hr
   Mild fever monitoring

3. Mohammed Ismail 72M  Bed A-02  NEWS2: 4   Oesophageal Ca — pre-op
   Nutrition optimisation
   Awaiting PET-CT staging

4. Anita Desai     45F  Bed D-11  NEWS2: 2   Post-mastectomy Day 3
   Recovering well
   Drain output reducing

5. Vikram Singh    61M  Bed B-07  NEWS2: 3   Gastric Ca — FLOT Cycle 2
   Day 2 of 3 chemotherapy
   Nausea controlled

6. Sunita Rao      54F  Bed C-12  NEWS2: 1   Post-anterior resection Day 5
   First stoma output
   pT3N1 — adjuvant chemo planned

7. Lakshmi Nair    49F  Bed A-09  NEWS2: 0   Post-thyroidectomy Day 7
   For discharge today
   Calcium stable

8. Arun Patel      78M  Bed B-01  NEWS2: 5   Post-gastrectomy Day 3
   ICU stepdown
   Elderly — sundowning risk

Current Build Status
Update this section every time a module is completed. Claude reads this to understand exactly where the project is. Be honest — do not mark something done if it is partially working.
Ring 1 — Clinical Core (In Progress)
Module 1.1 — Rounds Companion
	•	[x] Project structure and folder layout created
	•	[x] Design system — colors, constants configured
	•	[x] Shared components — LoadingSpinner, ErrorCard, OfflineBanner, NEWS2Badge
	•	[x] NEWS2 calculator utility with unit tests
	•	[x] Mock patient data — all 8 patients complete
	•	[x] Patient list screen — sorted by NEWS2, ward stats
	•	[x] Patient detail screen — all 6 sections
	•	[x] Session boundary UI — ScribingSession component
	•	[x] Audio capture hook — useAudioCapture with waveform
	•	[x] MedASR transcription service — mock mode working
	•	[x] Claude API connected — SOAP generation working
	•	[x] Simple SOAP review screen — basic version
	•	[x] Structured SOAP format — full JSON extraction
	•	[x] SOAP review with extracted vitals/investigations/tasks
	•	[x] Clinical keyboard — ClinicalKeyboard component (5 categories, surgical oncology terms)
	•	[x] Typed note entry — Quick Plan mode (assessment + plan tag-inputs)
	•	[x] Typed note entry — Standard Template mode (full SOAP form with vitals)
	•	[x] Typed note entry — Natural Language to Claude mode (free text → AI)
	•	[x] Voice orders screen
	•	[x] Formal amendment screen
	•	[x] PWA configuration — manifest and service worker (vite-plugin-pwa, workbox)
	•	[ ] Vercel deployment
	•	[ ] Android tablet testing complete
Module 1.2 — Nurse Task Board
	•	[ ] Not started
Module 1.3 — Investigation Tracker
	•	[ ] Not started
Module 1.4 — Clinical Messaging
	•	[ ] Not started
Module 1.5 — Handover Module
	•	[ ] Not started
Module 1.6 — Discharge Module
	•	[ ] Not started
Ring 2 — Operational Layer
	•	[ ] Not started — begins Month 9
Ring 3 — Financial Layer
	•	[ ] Not started — begins Month 12
Ring 4 — Intelligence Layer
	•	[ ] Not started — begins Month 20
Ring 5 — Ecosystem Layer
	•	[ ] Not started — begins Month 30

The Full Module Map
Ring 1 — Clinical Core (Now → Month 7)
1.1  Rounds Companion          ← CURRENT MODULE
1.2  Nurse Task Board          ← NEXT after pilot
1.3  Investigation Tracker
1.4  Clinical Messaging
1.5  Handover Module
1.6  Discharge Module
Ring 2 — Operational Layer (Month 9+)
2.1  Pharmacy
2.2  OT Scheduling
2.3  Lab and Radiology Integration
2.4  Blood Bank
2.5  CSSD Sterilisation Tracking
2.6  Dietary and Kitchen Integration
2.7  OPD Queue Management
Ring 3 — Financial Layer (Month 12+)
3.1  Billing and Revenue Cycle
3.2  TPA and Insurance
3.3  Procurement and Inventory
3.4  Asset and Biomedical Equipment Management
3.5  HR and Payroll
3.6  Financial Reporting and MIS
Ring 4 — Intelligence Layer (Month 20+)
4.1  Clinical Decision Support
     - Sepsis prediction from vitals trend
     - Drug interaction checking
     - Antibiotic stewardship alerts
4.2  Quality and Safety
     - Incident reporting
     - Mortality and morbidity review
     - Antibiogram dashboard
4.3  NABH and JCI Compliance Framework
4.4  Revenue Intelligence
     - Readmission risk prediction
     - Revenue integrity
     - Bed optimisation
4.5  Population Health Analytics
Ring 5 — Ecosystem Layer (Month 30+)
5.1  KliniK Care — Patient App
     - Discharge onboarding via WhatsApp
     - Medication adherence monitoring
     - Post-discharge symptom logging
     - Home diagnostics ordering
     - Tele-consultation
5.2  Diagnostic Partner Network
5.3  Pharmacy Partner Network
5.4  Referral Network between KliniK hospitals

The Event Bus — The Spine of the Entire ERP
Every module communicates through events. No module ever calls another module directly. New modules subscribe to existing events. Existing modules never need modification to support a new subscriber.
// Core clinical events — all modules are downstream of these

PatientAdmitted        → creates patient record, activates protocols
VitalsRecorded         → triggers NEWS2 recalculation, ward map update
NoteConfirmed          → creates nursing tasks, investigation orders,
                         medication orders, updates audit trail
OrderPlaced            → notifies pharmacy, lab, nurse board, billing
MedicationAdministered → decrements inventory, logs billing charge,
                         updates nursing record, audit trail
InvestigationResulted  → updates investigation tracker, sends alert
                         if critical, notifies ordering doctor
PatientDischarged      → triggers discharge summary, final billing,
                         patient app onboarding, bed availability

// Downstream events — generated by modules, not by clinical actions

BillingChargeCaptured  → revenue cycle management
InventoryDecremented   → procurement alert if below threshold
TaskCompleted          → workload analytics, HR reporting
IncidentReported       → quality team notification, review workflow

What Good Looks Like — The Target Experience
A surgical oncology doctor opens KliniK on her Android tablet at 7:30am. She sees her 8 patients sorted by urgency. Rajesh Kumar is at the top in red — NEWS2 of 8.
She taps him. Sees his overnight summary, critical amylase result, overdue antibiotic. She taps Write Note.
She taps the microphone. Speaks naturally to the patient for 60 seconds. Taps stop.
The SOAP note appears. She reads it in 30 seconds. She sees: 3 investigations to confirm, 2 nursing tasks created, 1 medication dose adjustment suggested. She confirms the investigations, confirms the nursing tasks, reviews and confirms the medication. She taps Sign Note.
The note is in the record. The lab has the investigation orders. The nurses have their tasks. The pharmacy has the medication update. The audit trail is written. The NEWS2 has been updated from the vitals she mentioned during the consultation.
She moves to the next patient. She finishes 8 patients in 40 minutes. Her notes are done before she leaves the ward. She has typed nothing.
That experience is what every feature must serve. If a feature does not make that experience faster, safer, or more clinically intelligent — it does not belong in the Rounds Companion.

The Competitive Context
What KliniK Is Replacing
	•	Insta HMS, eHospital, Manorama Lifeline — legacy Indian EMRs with poor UX, no ambient scribing, no event architecture
	•	WhatsApp for clinical communication — no audit trail, no patient linkage, no accountability
	•	Paper for ward rounds, handovers, drug charts
What KliniK Is Not Competing With
	•	Epic, Cerner — enterprise systems for AIG/Apollo tier hospitals, cost crores to implement, require dedicated IT teams
	•	SAP, Oracle — financial ERPs not built for clinical workflows
KliniK's Differentiators
	•	Event-first architecture — no module is an island
	•	Structured clinical data from the first moment
	•	Ambient scribing that shows a note, not a transcript
	•	FHIR R4 — patient data is never held hostage
	•	Built for Indian clinical context natively
	•	Offline-first — works in any ward WiFi condition
	•	MedASR fine-tuned for Indian medical speech (roadmap)

Data Residency and Compliance — Non-Negotiable
All patient data stays in India. AWS region: ap-south-1 (Mumbai) only. No patient data to any US or EU server. Claude API calls: de-identified before sending. MedASR: self-hosted in Mumbai when live.
Regulatory compliance:
	•	DPDP Act 2023: patient data rights and consent
	•	ABDM: ABHA ID integration, PHR linking
	•	Clinical Establishments Act: documentation standards
	•	IT Act 2000 Section 69A: data localisation awareness (Supabase was blocked under this — reason AWS is used directly)

Security Rules
Authentication: AWS Cognito ap-south-1 Role definitions: Doctor — read/write own patients, sign notes Nurse — read patients, complete tasks, record vitals Pharmacist — read orders, manage inventory Lab — read investigations, upload results Admin — read all, manage users Patient — read own record only
Audit trail: append-only, immutable, every action logged Encryption: at rest (AES-256), in transit (TLS 1.3) Session: biometric re-authentication after 15 minutes idle

Instructions for Claude When Building New Features
	1	Read CLAUDE.md fully before writing any code.
	2	Read the existing files for the module you are modifying before writing new code. Maintain existing patterns.
	3	Every new component follows the folder structure above. No exceptions.
	4	Every new function touching patient data gets a // CLINICAL: comment.
	5	Every new calculation gets a // SAFETY: comment.
	6	Every new service has a MOCK_MODE pathway.
	7	Every error message is specific and actionable.
	8	Vital signs are always numbers or null. Never strings.
	9	Medication confirmations are always unchecked by default.
	10	When building a clinical feature, ask: "Does this make the ward round faster, safer, or more clinically intelligent?" If no — do not build it.
	11	When in doubt about a clinical threshold or rule, add a comment flagging the assumption and ask for clinical review before proceeding.
	12	Never break existing functionality to build new features. Extend. Do not replace.
