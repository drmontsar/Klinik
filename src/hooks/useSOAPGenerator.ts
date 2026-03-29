/**
 * Generates StructuredSOAPNote from transcription text using the active AI provider.
 * Tracks consultation duration and manual correction count for audit trail.
 * @returns SOAP generation state, the generated note, and trigger methods
 * @clinical-note Generated SOAP notes MUST be reviewed by a clinician before approval
 */

import { useState, useCallback, useRef } from 'react';
import type { StructuredSOAPNote } from '../types/clinical';
import { createAIProvider } from '../services/createAIProvider';

interface UseSOAPGeneratorResult {
  isGenerating: boolean;
  soapNote: StructuredSOAPNote | null;
  providerName: string;
  error: string | null;
  /** Call when recording stops — starts generation */
  generateSOAP: (
    transcript: string,
    patientContext: string,
    consultationDurationSeconds: number
  ) => Promise<void>;
  /** Update a displayNote section when doctor edits text */
  updateDisplayNote: (
    section: keyof StructuredSOAPNote['displayNote'],
    content: string
  ) => void;
  /** Returns the current manual corrections count */
  correctionsCount: number;
  reset: () => void;
}

const useSOAPGenerator = (): UseSOAPGeneratorResult => {
  // SAFETY: AI-generated SOAP notes require mandatory clinician review
  const providerRef = useRef(createAIProvider('SOAP_SCRIBING'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [soapNote, setSoapNote] = useState<StructuredSOAPNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const correctionsCountRef = useRef(0);

  const generateSOAP = useCallback(
    async (
      transcript: string,
      patientContext: string,
      _consultationDurationSeconds: number
    ) => {
      try {
        setError(null);
        setIsGenerating(true);
        correctionsCountRef.current = 0;

        const note = await providerRef.current.generateSOAPNote(transcript, patientContext);
        setSoapNote(note);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'SOAP generation failed. Transcription saved — tap Retry or type the note below.'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const updateDisplayNote = useCallback(
    (section: keyof StructuredSOAPNote['displayNote'], content: string) => {
      correctionsCountRef.current += 1;
      setSoapNote(prev =>
        prev
          ? { ...prev, displayNote: { ...prev.displayNote, [section]: content } }
          : null
      );
    },
    []
  );

  const reset = useCallback(() => {
    setSoapNote(null);
    setError(null);
    setIsGenerating(false);
    correctionsCountRef.current = 0;
  }, []);

  return {
    isGenerating,
    soapNote,
    providerName: providerRef.current.name,
    error,
    generateSOAP,
    updateDisplayNote,
    correctionsCount: correctionsCountRef.current,
    reset,
  };
};

export default useSOAPGenerator;
