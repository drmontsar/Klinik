/**
 * Generates SOAP notes from transcription text using the active AI provider.
 * @returns SOAP generation state, the generated note, and trigger method
 * @clinical-note Generated SOAP notes MUST be reviewed by a clinician before approval
 */

import { useState, useCallback, useRef } from 'react';
import type { SOAPNote } from '../types/clinical';
import { createAIProvider } from '../services/createAIProvider';

interface UseSOAPGeneratorResult {
    isGenerating: boolean;
    soapNote: SOAPNote | null;
    providerName: string;
    error: string | null;
    generateSOAP: (transcript: string, patientContext: string) => Promise<void>;
    updateSOAP: (section: keyof SOAPNote, content: string) => void;
    reset: () => void;
}

const useSOAPGenerator = (): UseSOAPGeneratorResult => {
    // SAFETY: AI-generated SOAP notes require mandatory clinician review
    const providerRef = useRef(createAIProvider());
    const [isGenerating, setIsGenerating] = useState(false);
    const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateSOAP = useCallback(async (transcript: string, patientContext: string) => {
        try {
            setError(null);
            setIsGenerating(true);

            const note = await providerRef.current.generateSOAPNote(transcript, patientContext);
            setSOAPNote(note);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'SOAP generation failed');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const updateSOAP = useCallback((section: keyof SOAPNote, content: string) => {
        setSOAPNote(prev => prev ? { ...prev, [section]: content } : null);
    }, []);

    const reset = useCallback(() => {
        setSOAPNote(null);
        setError(null);
        setIsGenerating(false);
    }, []);

    return {
        isGenerating,
        soapNote,
        providerName: providerRef.current.name,
        error,
        generateSOAP,
        updateSOAP,
        reset,
    };
};

export default useSOAPGenerator;
