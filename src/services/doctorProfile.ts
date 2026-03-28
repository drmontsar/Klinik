/**
 * Doctor profile — persists the treating doctor's identity and institution
 * details to localStorage. Loaded once on app start; used everywhere a
 * clinician name, specialty, or hospital identifier is needed.
 *
 * @clinical-note The doctor's name appears on every signed note, amendment,
 * and order in the permanent clinical record. It must never be a placeholder.
 */

export interface DoctorProfile {
  /** Full name including title — e.g. "Dr. Meera Iyer" */
  doctorName: string;
  /** Clinical specialty — e.g. "Surgical Oncology". Used in AI prompt. */
  specialty: string;
  /** Hospital / institution name — e.g. "Sunshine Hospital, Bengaluru" */
  hospitalName: string;
  /** Hospital number prefix — e.g. "KLK", "RMH", "AIIMS". Used in MRN generation. */
  hospitalNumberPrefix: string;
}

// CLINICAL: Versioned key — bump to v2 if DoctorProfile schema changes.
const PROFILE_KEY = 'klinik_doctor_profile_v1';

/**
 * Returns the stored doctor profile, or null if not yet set up.
 */
export function getDoctorProfile(): DoctorProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as DoctorProfile) : null;
  } catch {
    return null;
  }
}

/**
 * Persists the doctor profile to localStorage.
 * @param profile - The complete doctor profile to save
 */
export function saveDoctorProfile(profile: DoctorProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Returns true if a complete profile exists and the app is ready to use.
 * A profile is complete when doctorName and hospitalName are non-empty.
 */
export function isProfileComplete(): boolean {
  const p = getDoctorProfile();
  return !!(p?.doctorName?.trim() && p?.hospitalName?.trim());
}
