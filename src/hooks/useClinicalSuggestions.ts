import { useCallback } from 'react';

/**
 * Category of clinical field — drives which term bank is shown.
 * Each category has a curated seed list of surgical oncology terms.
 */
export type SuggestionCategory =
  | 'symptoms'
  | 'examination'
  | 'investigations'
  | 'medications'
  | 'nursing'
  | 'followUp'
  | 'assessment';

// CLINICAL: Seed term banks per category — surgical oncology context.
// Frequency learning will promote frequently used terms above these seeds.
const SEED_TERMS: Record<SuggestionCategory, string[]> = {
  symptoms: [
    'Pain at surgical site', 'Nausea', 'Vomiting', 'Fever', 'Rigors',
    'Abdominal distension', 'Poor oral intake', 'Dysphagia', 'Fatigue',
    'Shortness of breath', 'Palpitations', 'Loose stools', 'Constipation',
    'Wound discharge', 'Leg swelling', 'Reduced urine output',
  ],
  examination: [
    'Abdomen soft, non-tender', 'Abdomen distended', 'Wound clean and dry',
    'Wound erythema present', 'Drain insitu, bile-stained output',
    'Drain insitu, serous output', 'Stoma pink and functioning',
    'Chest clear', 'Crepitations at bases', 'Heart sounds normal',
    'Peripherally well perfused', 'Pedal oedema present', 'JVP not elevated',
    'Nasogastric tube insitu', 'Central line insitu', 'Urinary catheter insitu',
  ],
  investigations: [
    'FBC + CRP', 'LFT', 'RFT', 'Coagulation profile', 'Serum amylase',
    'Blood culture x2', 'Urine culture', 'Drain fluid amylase',
    'Wound swab culture', 'CT Abdomen + Pelvis', 'USG Abdomen',
    'Chest X-Ray', 'ECG', 'Echo', 'PET-CT', 'MRI Abdomen',
    'Serum albumin', 'HbA1c', 'Thyroid function', 'Tumour markers',
  ],
  medications: [
    'Inj. Piperacillin-Tazobactam 4.5g IV Q8H',
    'Inj. Meropenem 1g IV Q8H',
    'Inj. Metronidazole 500mg IV Q8H',
    'Inj. Morphine PCA 1mg bolus PRN',
    'Inj. Tramadol 100mg IV Q8H',
    'Tab. Paracetamol 1g PO Q6H',
    'Inj. Ondansetron 4mg IV Q8H PRN',
    'Inj. Pantoprazole 40mg IV BD',
    'Inj. Enoxaparin 40mg SC OD',
    'Inj. Insulin Actrapid sliding scale',
    'Tab. Metoclopramide 10mg PO TDS',
    'Syp. Lactulose 15ml PO BD',
    'Inj. Furosemide 40mg IV OD',
    'Tab. Amlodipine 5mg PO OD',
  ],
  nursing: [
    'Hourly urine output monitoring', 'Four-hourly vitals',
    'Two-hourly vitals', 'Drain output every 8 hours',
    'Wound inspection and dressing', 'Stoma bag change',
    'Strict fluid input-output chart', 'Deep breathing exercises',
    'Early mobilisation', 'Pressure area care',
    'Nasogastric tube aspiration', 'Blood glucose monitoring QID',
    'Oxygen via nasal prongs at 2L/min', 'Bed head elevation 30 degrees',
    'Falls precaution — call bell within reach',
  ],
  followUp: [
    'Review in 4 hours', 'Review in 6 hours', 'Review in 8 hours',
    'Review tomorrow morning', 'Surgical registrar review tonight',
    'Senior review if clinical deterioration', 'ICU review if NEWS2 rises',
    'Oncology review this week', 'Dietitian review', 'Physiotherapy review',
    'Review drain output at 6pm', 'Check culture results at 48 hours',
    'Repeat bloods at 6am', 'Repeat CT in 48 hours if no improvement',
  ],
  assessment: [
    'Post-op Day', 'Recovering well', 'Improving', 'Stable',
    'Borderline haemodynamics', 'Query anastomotic leak',
    'Surgical site infection', 'Sepsis — source under investigation',
    'Ileus — conservative management', 'Wound dehiscence',
    'Deep vein thrombosis', 'Pneumonia — hospital-acquired',
    'Urinary tract infection', 'Electrolyte imbalance',
    'Poor glycaemic control', 'Delirium — multifactorial',
  ],
};

// CLINICAL: localStorage key for persisting term usage frequencies.
// Keyed per device — intentional, as doctors on their own device
// should see their own commonly used terms, not a shared pool.
const STORAGE_KEY = 'klinik_term_freq_v1';

type FrequencyStore = Record<string, Record<string, number>>;

// Module-level singleton — one read from localStorage per session.
// Avoids repeated parsing on every keystroke.
let _store: FrequencyStore | null = null;

function getStore(): FrequencyStore {
  if (_store) return _store;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _store = raw ? (JSON.parse(raw) as FrequencyStore) : {};
  } catch {
    _store = {};
  }
  return _store;
}

function persistStore(store: FrequencyStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or unavailable — non-critical, suggestions still work from memory
  }
}

/**
 * Returns clinical term suggestions for a given category and query.
 * Merges seed terms with frequency-learned terms.
 * Prefix-matches on query, then sorts by usage frequency descending.
 *
 * @param category - The type of clinical field being edited
 * @param query - Current text in the field, used for prefix filtering
 * @returns Up to 10 matching suggestions sorted by frequency
 * @clinical-note Frequency data is per-device — designed for a doctor
 * using KliniK on her own tablet. Shared devices will share frequency state.
 */
function getSuggestions(category: SuggestionCategory, query: string): string[] {
  const store = getStore();
  const freqMap = store[category] ?? {};
  const seeds = SEED_TERMS[category];

  // Merge seeds with any user-typed terms that have frequency > 0
  const allTerms = Array.from(new Set([
    ...seeds,
    ...Object.keys(freqMap),
  ]));

  const q = query.trim().toLowerCase();
  const filtered = q.length === 0
    ? allTerms
    : allTerms.filter(t => t.toLowerCase().includes(q));

  // Sort: higher frequency first, then alphabetical for ties
  filtered.sort((a, b) => {
    const fa = freqMap[a] ?? 0;
    const fb = freqMap[b] ?? 0;
    if (fb !== fa) return fb - fa;
    return a.localeCompare(b);
  });

  return filtered.slice(0, 10);
}

/**
 * Records that a term was used in a given category.
 * Increments its frequency in the localStorage store.
 * The next call to getSuggestions will rank it higher.
 *
 * @param category - The type of clinical field
 * @param term - The exact term that was selected or typed
 * @clinical-note Usage recording happens on confirm (Enter / tag creation),
 * not on every keystroke. This reflects genuine clinical intent.
 */
function recordUsage(category: SuggestionCategory, term: string): void {
  const trimmed = term.trim();
  if (!trimmed) return;
  const store = getStore();
  if (!store[category]) store[category] = {};
  store[category][trimmed] = (store[category][trimmed] ?? 0) + 1;
  persistStore(store);
}

/**
 * Hook providing clinical term suggestions with frequency-based learning.
 * Stable — returns functions that are safe to use in dependency arrays.
 *
 * @returns getSuggestions and recordUsage functions
 * @clinical-note All state is module-level to survive re-renders without
 * triggering unnecessary suggestion re-computation.
 */
export default function useClinicalSuggestions() {
  const get = useCallback(getSuggestions, []);
  const record = useCallback(recordUsage, []);
  return { getSuggestions: get, recordUsage: record };
}
