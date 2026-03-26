import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import useAudioCapture from '../hooks/useAudioCapture';
import useMedASRTranscription from '../hooks/useMedASRTranscription';
import useSOAPGenerator from '../hooks/useSOAPGenerator';
import ScribingSession from '../components/scribing/ScribingSession';
import SOAPReviewScreen from '../components/scribing/SOAPReviewScreen';
import { createRepository } from '../services/createRepository';

/**
 * Scribing screen — orchestrates the full scribing pipeline:
 * 1. Load ASR model
 * 2. Record audio → live transcription
 * 3. Stop → generate SOAP via AI provider
 * 4. Review/edit SOAP → approve → save to patient record
 *
 * @param patientId - The patient being scribed
 * @param onBack - Callback to return to the patient detail
 * @param onComplete - Callback when scribing session is complete
 */

type ScribingPhase = 'recording' | 'review';

const ScribingScreen: React.FC<{
    patientId: string;
    onBack: () => void;
    onComplete: () => void;
}> = ({ patientId, onBack, onComplete }) => {
    const [phase, setPhase] = React.useState<ScribingPhase>('recording');
    const [patient, setPatient] = React.useState<Patient | null>(null);
    const repository = useMemo(() => createRepository(), []);

    // Hooks
    const audioCapture = useAudioCapture();
    const transcription = useMedASRTranscription();
    const soapGenerator = useSOAPGenerator();

    // Track whether we're waiting for final transcription before generating SOAP
    const pendingSOAPRef = useRef(false);

    // Load patient from repository (not from mock data directly)
    useEffect(() => {
        repository.getPatientById(patientId).then(p => setPatient(p ?? null));
    }, [repository, patientId]);

    // Build patient context string for SOAP generation
    const patientContext = useMemo(() => {
        if (!patient) return `Patient ID: ${patientId}`;
        return `Name: ${patient.name}, Age: ${patient.age}, Sex: ${patient.sex}
Diagnosis: ${patient.diagnosis}
Day of Stay: ${patient.dayOfStay}
Active Problems: ${patient.problems.join('; ')}
Current Medications: ${patient.medications.filter(m => m.isActive).map(m => `${m.name} ${m.dose} ${m.route}`).join('; ')}
Latest Vitals: HR ${patient.vitals.heartRate}, BP ${patient.vitals.systolicBP}/${patient.vitals.diastolicBP}, RR ${patient.vitals.respirationRate}, SpO2 ${patient.vitals.spO2}%, Temp ${patient.vitals.temperature}°C, Consciousness: ${patient.vitals.consciousness}`;
    }, [patient, patientId]);

    // Load model on mount
    useEffect(() => {
        transcription.loadModel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // FIX: React to transcript completion instead of using setTimeout + stale closure.
    // When captureState becomes 'stopped' and we have a transcript, generate SOAP.
    useEffect(() => {
        if (
            pendingSOAPRef.current &&
            audioCapture.captureState === 'stopped' &&
            !transcription.isTranscribing &&
            transcription.fullTranscript
        ) {
            pendingSOAPRef.current = false;
            soapGenerator.generateSOAP(transcription.fullTranscript, patientContext);
            setPhase('review');
        }
    }, [
        audioCapture.captureState,
        transcription.isTranscribing,
        transcription.fullTranscript,
        soapGenerator,
        patientContext,
    ]);

    const handleStart = useCallback(() => {
        audioCapture.startCapture((chunk) => {
            transcription.processAudioChunk(chunk);
        });
    }, [audioCapture, transcription]);

    const handlePause = useCallback(() => {
        audioCapture.pauseCapture();
    }, [audioCapture]);

    const handleResume = useCallback(() => {
        audioCapture.resumeCapture();
    }, [audioCapture]);

    const handleStop = useCallback(() => {
        const fullAudio = audioCapture.stopCapture();
        if (fullAudio) {
            transcription.finalizeTranscription(fullAudio);
        }
        // Signal that we want SOAP generation once transcript is ready
        pendingSOAPRef.current = true;
    }, [audioCapture, transcription]);

    const handleApprove = useCallback(async () => {
        if (!soapGenerator.soapNote) return;

        const note = {
            id: `N-${Date.now()}`,
            author: 'AI Scribe',
            content: `**Subjective:** ${soapGenerator.soapNote.subjective}\n\n**Objective:** ${soapGenerator.soapNote.objective}\n\n**Assessment:** ${soapGenerator.soapNote.assessment}\n\n**Plan:** ${soapGenerator.soapNote.plan}`,
            type: 'ward-round' as const,
            isAIGenerated: true,
            createdAt: new Date().toISOString(),
            isApproved: true,
        };

        await repository.addNote(patientId, note);
        onComplete();
    }, [soapGenerator.soapNote, repository, patientId, onComplete]);

    const handleReject = useCallback(() => {
        soapGenerator.reset();
        audioCapture.resetCapture();
        transcription.reset();
        pendingSOAPRef.current = false;
        setPhase('recording');
    }, [soapGenerator, audioCapture, transcription]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: COLORS.bgSubtle }}>
            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)', zIndex: 10, padding: '16px 24px',
                borderBottom: `1px solid ${COLORS.borderLight}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <button onClick={onBack} style={{
                    background: 'none', border: 'none', color: COLORS.textTertiary,
                    fontSize: '16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', fontWeight: 500,
                }}>
                    <span>←</span> Back to Patient
                </button>
                <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
                    🎙️ AI Scribing
                </div>
            </div>

            {/* Patient Context Bar */}
            <div style={{
                padding: '12px 24px', backgroundColor: COLORS.brandSubtle,
                borderBottom: `1px solid ${COLORS.brandBorder}`, fontSize: '14px',
                color: COLORS.textSecondary,
            }}>
                <strong style={{ color: COLORS.text }}>{patient?.name || patientId}</strong>
                {patient && <span style={{ marginLeft: '8px' }}>— {patient.diagnosis}</span>}
            </div>

            {/* Main Content */}
            <div style={{ padding: '24px' }}>
                {phase === 'recording' && (
                    <ScribingSession
                        captureState={audioCapture.captureState}
                        isModelLoaded={transcription.isModelLoaded}
                        loadingProgress={transcription.loadingProgress}
                        pendingAudioSeconds={transcription.pendingAudioSeconds}
                        segments={transcription.segments}
                        fullTranscript={transcription.fullTranscript}
                        isTranscribing={transcription.isTranscribing}
                        analyserNode={audioCapture.analyserNode}
                        error={audioCapture.error || transcription.error}
                        onStart={handleStart}
                        onPause={handlePause}
                        onResume={handleResume}
                        onStop={handleStop}
                    />
                )}

                {phase === 'review' && (
                    <SOAPReviewScreen
                        soapNote={soapGenerator.soapNote}
                        providerName={soapGenerator.providerName}
                        onUpdateSection={soapGenerator.updateSOAP}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isGenerating={soapGenerator.isGenerating}
                        generateError={soapGenerator.error}
                    />
                )}
            </div>
        </div>
    );
};

export default ScribingScreen;
