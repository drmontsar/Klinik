/**
 * Shared medication type for OPD clinical notes.
 * Used in both initial assessments and follow-up visits.
 */

export interface OPMedication {
  id: string;
  /** CLINICAL: Preserve Indian brand names exactly. Never normalise or translate. */
  drug: string;
  dose: string;
  route: 'oral' | 'IV' | 'IM' | 'SC' | 'topical' | 'other';
  /** OD / BD / TDS / QID / SOS / PRN / HS / AC / PC */
  frequency: string;
  duration: string;
  instructions: string | null;
}
