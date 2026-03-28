import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { COLORS } from '../constants/colors';
import type { Patient } from '../types/patient';
import useAudioCapture from '../hooks/useAudioCapture';
import useMedASRTranscription from '../hooks/useMedASRTranscription';
import useSOAPGenerator from '../hooks/useSOAPGenerator';
import ScribingSession from '../components/scribing/ScribingSession';
import SOAPReviewScreen from '../components/scribing/SOAPReviewScreen';
import type { ConfirmedPlanItems } from '../components/scribing/SOAPReviewScreen';
import NoteExportPanel from '../components/scribing/NoteExportPanel';
import type { NoteExportData } from '../utils/exportSOAPNote';
import { createRepository } from '../services/createRepository';

/**
 * Scribing screen — orchestrates the full scribing pipeline:
 * 1. Load ASR model
 * 2. Record audio → live transcription
 * 3. Stop → generate StructuredSOAPNote via AI provider
 * 4. Review/confirm plan items → sign → save to patient record
 *
 * @param patientId - The patient being scribed
 * @param onBack - Callback to return to patient detail
 * @param onComplete - Callback when scribing session is complete
 */

type ScribingPhase = 'recording' | 'review' | 'export';

const ScribingScreen: React.FC<{
  patientId: string;
  onBack: () => void;
  onComplete: () => void;
}> = ({ patientId, onBack, onComplete }) => {
  const [phase, setPhase] = React.useState<ScribingPhase>('recording');
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [exportData, setExportData] = React.useState<NoteExportData | null>(null);
  const repository = useMemo(() => createRepository(), []);

  const audioCapture = useAudioCapture();
  const transcription = useMedASRTranscription();
  const soapGenerator = useSOAPGenerator();

  // Track duration and whether we're waiting for transcription before generating SOAP
  const sessionStartRef = useRef<number>(0);
  const pendingSOAPRef = useRef(false);

  // Load patient from repository
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

  // Load ASR model on mount
  useEffect(() => {
    transcription.loadModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to transcript completion — generate SOAP once transcription is finalised
  useEffect(() => {
    if (
      pendingSOAPRef.current &&
      audioCapture.captureState === 'stopped' &&
      !transcription.isTranscribing &&
      transcription.fullTranscript
    ) {
      pendingSOAPRef.current = false;
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      soapGenerator.generateSOAP(transcription.fullTranscript, patientContext, durationSeconds);
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
    sessionStartRef.current = Date.now();
    audioCapture.startCapture(chunk => {
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
    pendingSOAPRef.current = true;
  }, [audioCapture, transcription]);

  // CLINICAL: handleApprove saves confirmed plan items as a structured note,
  // then transitions to the export phase so the doctor can send the note
  // to their existing hospital EMR without any API integration.
  // Only items the doctor explicitly confirmed are passed downstream.
  const handleApprove = useCallback(
    async (confirmedItems: ConfirmedPlanItems) => {
      if (!soapGenerator.soapNote) return;

      const note = soapGenerator.soapNote.displayNote;
      const signedAt = new Date().toISOString();

      // Build the plan section for both storage and export
      const planLines = [
        ...confirmedItems.investigations.map(i => `• [Investigation] ${i}`),
        ...confirmedItems.medications.map(m => `• [Medication] ${m}`),
        ...confirmedItems.nursing.map(n => `• [Nursing] ${n}`),
        ...confirmedItems.followUp.map(f => `• [Follow-up] ${f}`),
      ].join('\n');

      const content = [
        `**Subjective:** ${note.subjective}`,
        `**Objective:** ${note.objective}`,
        `**Assessment:** ${note.assessment}`,
        `**Plan:**\n${planLines}`,
      ].join('\n\n');

      await repository.addNote(patientId, {
        id: `N-${Date.now()}`,
        author: 'AI Scribe',
        content,
        type: 'ward-round',
        isAIGenerated: true,
        createdAt: signedAt,
        isApproved: true,
      });

      // Prepare export data so the doctor can send this note to their EMR
      setExportData({
        patientName: patient?.name ?? patientId,
        hospitalNumber: patient?.hospitalNumber ?? '',
        diagnosis: patient?.diagnosis ?? '',
        signedAt,
        subjective: note.subjective,
        objective: note.objective,
        assessment: note.assessment,
        plan: planLines || 'No plan items confirmed.',
      });

      setPhase('export');
    },
    [soapGenerator.soapNote, repository, patientId, patient]
  );

  const handleReject = useCallback(() => {
    soapGenerator.reset();
    audioCapture.resetCapture();
    transcription.reset();
    pendingSOAPRef.current = false;
    setPhase('recording');
  }, [soapGenerator, audioCapture, transcription]);

  const consultationDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        backgroundColor: COLORS.bgSubtle,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
          padding: '16px 24px',
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.textTertiary,
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
        >
          ← Back to Patient
        </button>
        <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
          🎙️ AI Scribing
        </div>
      </div>

      {/* Patient context bar */}
      <div
        style={{
          padding: '12px 24px',
          backgroundColor: COLORS.brandSubtle,
          borderBottom: `1px solid ${COLORS.brandBorder}`,
          fontSize: '14px',
          color: COLORS.textSecondary,
        }}
      >
        <strong style={{ color: COLORS.text }}>{patient?.name || patientId}</strong>
        {patient && <span style={{ marginLeft: '8px' }}>— {patient.diagnosis}</span>}
      </div>

      {/* Main content */}
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
            consultationDurationSeconds={consultationDuration}
            onUpdateDisplayNote={soapGenerator.updateDisplayNote}
            onApprove={handleApprove}
            onReject={handleReject}
            isGenerating={soapGenerator.isGenerating}
            generateError={soapGenerator.error}
          />
        )}

        {phase === 'export' && exportData && (
          <NoteExportPanel
            noteData={exportData}
            onDone={onComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ScribingScreen;
