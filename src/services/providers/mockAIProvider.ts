/**
 * Mock AI Provider — returns a realistic StructuredSOAPNote for development and testing.
 * No API calls, no API keys required. Used when AI_PROVIDER = 'mock' in config.
 */

import type { StructuredSOAPNote } from '../../types/clinical';
import type { AIProvider } from '../aiProvider';

export class MockAIProvider implements AIProvider {
  readonly name = 'Mock (Development)';

  async generateSOAPNote(
    transcript: string,
    patientContext: string
  ): Promise<StructuredSOAPNote> {
    // Simulate realistic API latency
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Use patient context to personalise the mock note slightly
    const isPostWhipple = patientContext.includes('Whipple') || patientContext.includes('pancreas');
    const isPostHemicolectomy = patientContext.includes('hemicolectomy') || patientContext.includes('colectomy');
    const isChemo = patientContext.includes('FLOT') || patientContext.includes('chemo');

    if (isPostWhipple) {
      return mockWhippleNote(transcript);
    }
    if (isPostHemicolectomy) {
      return mockHemicolectomyNote(transcript);
    }
    if (isChemo) {
      return mockChemoNote(transcript);
    }
    return mockGenericNote(transcript);
  }
}

// CLINICAL: Mock data is realistic for a post-Whipple Day 1 patient with suspected anastomotic leak.
function mockWhippleNote(_transcript: string): StructuredSOAPNote {
  return {
    subjective: {
      chiefComplaint: 'Abdominal pain and fever post-Whipple procedure',
      symptoms: [
        'Abdominal pain — moderate, around drain site',
        'Fever since 0230hrs',
        'Nausea — controlled with Ondansetron',
        'Poor oral intake',
      ],
      painScore: 6,
      patientStatement: 'Pain is manageable with the PCA. Feeling feverish and weak.',
    },
    objective: {
      temperature: 38.6,
      heartRate: 114,
      systolicBP: 98,
      diastolicBP: 62,
      spo2: 96,
      respiratoryRate: 22,
      findings: [
        'Abdomen soft, mild tenderness around Jackson-Pratt drain site',
        'Drain output 280ml overnight — bile-stained',
        'Wound intact, no erythema',
        'Mild tachycardia, borderline hypotension',
        'No peritoneal signs',
      ],
    },
    assessment: {
      primaryDiagnosis: 'Post-Whipple Day 1 — fever and drain output consistent with possible anastomotic leak vs early surgical site infection',
      activeProblemsSummary:
        'Post-Whipple Day 1. Febrile (38.6°C). Serum amylase critically elevated at 1840 U/L. Drain fluid amylase pending. Borderline haemodynamics — SBP 98, HR 114. WBC 18.4, CRP 186.',
      clinicalReasoning:
        'Elevated serum amylase in context of fever, tachycardia and bile-stained drain output raises concern for pancreatic fistula or anastomotic leak. Blood cultures sent at 0300hrs. IV Piperacillin-Tazobactam commenced empirically. CT abdomen indicated if clinical deterioration.',
    },
    plan: {
      investigations: [
        'Drain fluid amylase — result pending, review urgently',
        'Blood culture x2 — sent at 0300hrs, chase result',
        'Repeat CBC + CRP at 1200hrs',
        'CT Abdomen with contrast if haemodynamics worsen or drain output increases',
      ],
      // SAFETY: Medication orders are NEVER auto-confirmed.
      // Always require explicit doctor tap to confirm.
      medications: [
        'Inj. Piperacillin-Tazobactam 4.5g IV Q8H — continue, next dose due',
        'Inj. Morphine PCA 1mg bolus PRN — continue',
        'Inj. Pantoprazole 40mg IV BD — continue',
        'Inj. Ondansetron 4mg IV Q8H — continue',
        'Inj. Enoxaparin 40mg SC OD — continue (review if bleeding risk increases)',
      ],
      nursing: [
        'Strict fluid balance — hourly urine output, target >0.5ml/kg/hr',
        'Drain output — record colour and volume every 4 hours',
        'NEWS2 monitoring every 2 hours given score of 8',
        'IV line patency check — two large-bore cannulas in situ',
        'Notify doctor immediately if SBP drops below 90 or HR above 130',
      ],
      followUp: [
        'Review drain fluid amylase result urgently when available',
        'Surgical consultant review at 1200hrs',
        'Intensivist input if haemodynamics do not improve with fluids',
        'Family update — son contacted at 0400hrs, update again at 1000hrs',
      ],
      allPlanItems: [
        'Drain fluid amylase result pending — review urgently',
        'Blood culture x2 — chase',
        'Repeat CBC + CRP at 1200hrs',
        'CT Abdomen if deterioration',
        'Inj. Piperacillin-Tazobactam 4.5g IV Q8H — continue',
        'Inj. Morphine PCA — continue',
        'Strict fluid balance — hourly urine output',
        'Drain output — record every 4 hours',
        'NEWS2 2-hourly',
        'Surgical consultant review at 1200hrs',
      ],
    },
    displayNote: {
      subjective:
        'Patient reports moderate abdominal pain (6/10) around drain site with fever since 0230hrs. Nausea controlled. Poor oral intake. Pain manageable on PCA.',
      objective:
        'T 38.6°C, HR 114, BP 98/62, SpO2 96%, RR 22. Abdomen soft with mild drain site tenderness. Drain output 280ml overnight, bile-stained. Wound intact. No peritoneal signs.',
      assessment:
        'Post-Whipple Day 1. Fever, tachycardia and critically elevated serum amylase (1840 U/L) with bile-stained drain output — concern for pancreatic fistula or anastomotic leak vs early SSI. Empirical antibiotics commenced. Drain fluid amylase pending.',
      plan:
        'Drain fluid amylase — result pending urgently. Blood cultures sent, chase. Repeat CBC/CRP at 1200hrs. CT abdomen if clinical deterioration. Continue Piperacillin-Tazobactam, PCA, Pantoprazole, Ondansetron, Enoxaparin. Hourly fluid balance. NEWS2 2-hourly. Surgical review 1200hrs.',
    },
  };
}

function mockHemicolectomyNote(_transcript: string): StructuredSOAPNote {
  return {
    subjective: {
      chiefComplaint: 'Post-hemicolectomy Day 2 — monitoring',
      symptoms: ['Reduced urine output', 'Mild lower abdominal discomfort', 'Low-grade fever'],
      painScore: 3,
      patientStatement: 'Pain is manageable. Feeling a bit thirsty.',
    },
    objective: {
      temperature: 37.8,
      heartRate: 94,
      systolicBP: 108,
      diastolicBP: 68,
      spo2: 97,
      respiratoryRate: 18,
      findings: [
        'Urine output 28ml/hr — borderline oliguria',
        'Abdomen soft, mild tenderness at anastomosis site',
        'Stoma not yet active',
        'Wound clean and dry',
      ],
    },
    assessment: {
      primaryDiagnosis: 'Post-hemicolectomy Day 2 — borderline oliguria requiring fluid optimisation',
      activeProblemsSummary: 'Borderline oliguria 28ml/hr. Mild fever. Haemodynamics satisfactory.',
      clinicalReasoning:
        'Oliguria likely hypovolaemia in context of post-operative fluid shifts. Trial fluid bolus. Monitor closely.',
    },
    plan: {
      investigations: ['Urine dipstick', 'U&E and creatinine', 'Urine osmolality'],
      medications: ['IV fluid bolus 500ml Normal Saline over 1 hour — assess response'],
      nursing: [
        'Strict hourly fluid balance',
        'Urine output — alert if <20ml/hr for 2 consecutive hours',
      ],
      followUp: ['Reassess urine output in 2 hours post-bolus', 'Review U&E results'],
      allPlanItems: [
        'Urine dipstick',
        'U&E and creatinine',
        'IV fluid bolus 500ml NS over 1 hour',
        'Hourly fluid balance',
        'Reassess in 2 hours',
      ],
    },
    displayNote: {
      subjective: 'Patient reports manageable pain (3/10) and thirst. Mild lower abdominal discomfort.',
      objective: 'T 37.8°C, HR 94, BP 108/68, SpO2 97%, RR 18. Urine output 28ml/hr. Abdomen soft.',
      assessment: 'Post-hemicolectomy Day 2. Borderline oliguria — likely hypovolaemia. Haemodynamics satisfactory.',
      plan: 'U&E, urine dipstick. IV fluid bolus 500ml NS. Hourly fluid balance. Reassess in 2 hours.',
    },
  };
}

function mockChemoNote(_transcript: string): StructuredSOAPNote {
  return {
    subjective: {
      chiefComplaint: 'FLOT chemotherapy cycle — Day 2 nausea monitoring',
      symptoms: ['Nausea — controlled', 'Fatigue', 'Reduced appetite'],
      painScore: 1,
      patientStatement: 'Nausea is much better today. Just very tired.',
    },
    objective: {
      temperature: 37.1,
      heartRate: 82,
      systolicBP: 118,
      diastolicBP: 74,
      spo2: 98,
      respiratoryRate: 16,
      findings: ['PICC line site clean', 'No neutropenic signs', 'Good hydration'],
    },
    assessment: {
      primaryDiagnosis: 'Gastric carcinoma — FLOT cycle 2 Day 2, tolerating well',
      activeProblemsSummary: 'Nausea controlled. Fatigue expected. No febrile neutropenia.',
      clinicalReasoning: 'Chemotherapy proceeding as planned. Anti-emetics effective.',
    },
    plan: {
      investigations: ['CBC tomorrow morning — neutrophil count'],
      medications: ['Tab. Ondansetron 8mg PO TDS — continue', 'Tab. Dexamethasone 4mg PO BD — continue for 2 more days'],
      nursing: ['Oral intake and output chart', 'Mouth care BD'],
      followUp: ['Review CBC tomorrow', 'Oncology review Day 3'],
      allPlanItems: ['CBC tomorrow', 'Continue anti-emetics', 'Oral intake chart', 'Oncology review Day 3'],
    },
    displayNote: {
      subjective: 'Patient reports nausea controlled, significant fatigue, reduced appetite. Pain minimal (1/10).',
      objective: 'T 37.1°C, HR 82, BP 118/74, SpO2 98%, RR 16. PICC site clean. No febrile signs.',
      assessment: 'FLOT cycle 2 Day 2 — tolerating chemotherapy well. Nausea controlled with anti-emetics.',
      plan: 'CBC tomorrow. Continue Ondansetron and Dexamethasone. Oral intake chart. Oncology review Day 3.',
    },
  };
}

function mockGenericNote(transcript: string): StructuredSOAPNote {
  const words = transcript.split(' ').slice(0, 8).join(' ');
  return {
    subjective: {
      chiefComplaint: 'Ward round review',
      symptoms: ['As per transcript'],
      painScore: null,
      patientStatement: words || 'Patient reviewed on ward round.',
    },
    objective: {
      temperature: null,
      heartRate: null,
      systolicBP: null,
      diastolicBP: null,
      spo2: null,
      respiratoryRate: null,
      findings: ['Vitals as per nursing chart', 'Patient examined — no acute new findings'],
    },
    assessment: {
      primaryDiagnosis: 'Clinical progress as expected',
      activeProblemsSummary: 'Continue current management',
      clinicalReasoning: 'Clinical progress in line with expected course.',
    },
    plan: {
      investigations: [],
      medications: [],
      nursing: ['Routine observations', 'Fluid balance'],
      followUp: ['Reassess on next ward round'],
      allPlanItems: ['Routine observations', 'Fluid balance', 'Reassess next ward round'],
    },
    displayNote: {
      subjective: words || 'Patient reviewed on ward round.',
      objective: 'Vitals as per nursing chart. No acute new findings on examination.',
      assessment: 'Clinical progress as expected. Continue current management.',
      plan: 'Routine observations and fluid balance. Reassess on next ward round.',
    },
  };
}
