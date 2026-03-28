import { useState, useEffect, useMemo } from 'react';
import type { Patient } from './types/patient';
import { createRepository } from './services/createRepository';
import { isProfileComplete } from './services/doctorProfile';
import WardListScreen from './screens/WardListScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';
import ScribingScreen from './screens/ScribingScreen';
import NoteEntryScreen from './screens/NoteEntryScreen';
import OrdersScreen from './screens/OrdersScreen';
import AmendmentScreenPage from './screens/AmendmentScreen';
import AdmissionScreen from './screens/AdmissionScreen';
import SetupScreen from './screens/SetupScreen';
import OPDVisitTypeScreen from './screens/OPDVisitTypeScreen';
import ScratchpadScreen from './screens/ScratchpadScreen';
import ClinicalNoteReviewScreen from './screens/ClinicalNoteReviewScreen';
import type { NoteType } from './components/scratchpad/NoteTypeSelector';
import type { Stroke, ScratchpadNote } from './hooks/useScratchpad';

/**
 * Root application component with simple state-based screen routing.
 * Patient data is loaded via the repository — swap implementations in createRepository.ts.
 * @returns The active screen based on current navigation state
 */

/** All possible application screens */
type Screen = 'setup' | 'list' | 'detail' | 'scribing' | 'typed-note' | 'orders' | 'amend' | 'admission' | 'visit-type' | 'scratchpad' | 'note-review';

function App() {
  const repository = useMemo(() => createRepository(), []);
  const [patients, setPatients] = useState<Patient[]>([]);
  // Show setup screen on first launch if no doctor profile exists yet
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    isProfileComplete() ? 'list' : 'setup'
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Scratchpad flow state — preserved across the 3-step flow
  const [scratchpadNoteType, setScratchpadNoteType] = useState<NoteType | null>(null);
  const [scratchpadNote, setScratchpadNote] = useState<ScratchpadNote | null>(null);
  const [scratchpadStrokes, setScratchpadStrokes] = useState<Stroke[]>([]);

  // Load patients from repository on mount
  useEffect(() => {
    repository.getAllPatients().then(setPatients);
  }, [repository]);

  /**
   * Navigate to a patient's detail screen
   * @param patientId - The ID of the patient to view
   */
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentScreen('detail');
  };

  /**
   * Navigate back to the ward list
   */
  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPatientId(null);
  };

  /**
   * Navigate to the scribing screen for the selected patient
   */
  const handleStartScribing = () => {
    setCurrentScreen('scribing');
  };

  /**
   * Navigate to the typed note entry screen
   */
  const handleWriteNote = () => {
    setCurrentScreen('typed-note');
  };

  /**
   * Navigate to the admission form
   */
  const handleAdmitPatient = () => {
    setCurrentScreen('admission');
  };

  /**
   * Navigate to visit type selection (Step 1 of scratchpad flow)
   */
  const handleStartScribbling = () => {
    setCurrentScreen('visit-type');
  };

  /**
   * Navigate to the scratchpad canvas after note type is selected (Step 2)
   */
  const handleNoteTypeSelected = (type: NoteType) => {
    setScratchpadNoteType(type);
    setScratchpadStrokes([]);
    setCurrentScreen('scratchpad');
  };

  /**
   * Navigate to note review after canvas processing (Step 3)
   */
  const handleNoteProcessed = (note: ScratchpadNote, strokes: Stroke[]) => {
    setScratchpadNote(note);
    setScratchpadStrokes(strokes);
    setCurrentScreen('note-review');
  };

  /**
   * Return to canvas from review screen with strokes preserved for editing
   */
  const handleEditScribble = (strokes: Stroke[]) => {
    setScratchpadStrokes(strokes);
    setCurrentScreen('scratchpad');
  };

  /**
   * Note confirmed and saved — return to patient detail and clean up scratchpad state
   */
  const handleNoteConfirmed = () => {
    repository.getAllPatients().then(setPatients);
    setScratchpadNoteType(null);
    setScratchpadNote(null);
    setScratchpadStrokes([]);
    setCurrentScreen('detail');
  };

  /**
   * Discharge the selected patient — marks as discharged, removes from ward list.
   * CLINICAL: Record is preserved in the repository. Status is set to 'discharged'.
   */
  const handleDischarge = async () => {
    if (!selectedPatientId) return;
    await repository.dischargePatient(selectedPatientId);
    await repository.getAllPatients().then(setPatients);
    handleBackToList();
  };

  /**
   * Called after a new patient is successfully admitted.
   * Refreshes the patient list and navigates to the new patient's detail screen.
   */
  const handlePatientAdmitted = (newPatientId: string) => {
    repository.getAllPatients().then(setPatients);
    setSelectedPatientId(newPatientId);
    setCurrentScreen('detail');
  };

  /**
   * Navigate back to the patient detail screen (re-fetches data to pick up new notes)
   */
  const handleBackToDetail = () => {
    repository.getAllPatients().then(setPatients);
    setCurrentScreen('detail');
  };

  // Find selected patient from loaded data
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Render the active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'setup':
        return (
          <SetupScreen
            onComplete={() => setCurrentScreen('list')}
          />
        );

      case 'list':
        return (
          <WardListScreen
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onAdmitPatient={handleAdmitPatient}
          />
        );

      case 'admission':
        return (
          <AdmissionScreen
            onAdmitted={handlePatientAdmitted}
            onCancel={handleBackToList}
          />
        );

      case 'detail':
        if (!selectedPatient) {
          // SAFETY: Guard against missing patient — return to list
          setCurrentScreen('list');
          return null;
        }
        return (
          <PatientDetailScreen
            patient={selectedPatient}
            onBack={handleBackToList}
            onStartScribing={handleStartScribing}
            onWriteNote={handleWriteNote}
            onDischarge={handleDischarge}
            onStartScribbling={handleStartScribbling}
          />
        );

      case 'scribing':
        if (!selectedPatientId) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <ScribingScreen
            patientId={selectedPatientId}
            onBack={handleBackToDetail}
            onComplete={handleBackToDetail}
          />
        );

      case 'typed-note':
        if (!selectedPatient) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <NoteEntryScreen
            patient={selectedPatient}
            onBack={handleBackToDetail}
            onComplete={handleBackToDetail}
          />
        );

      case 'orders':
        if (!selectedPatientId) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <OrdersScreen
            patientId={selectedPatientId}
            onBack={handleBackToDetail}
          />
        );

      case 'amend':
        if (!selectedPatientId) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <AmendmentScreenPage
            patientId={selectedPatientId}
            onBack={handleBackToDetail}
          />
        );

      case 'visit-type':
        if (!selectedPatient) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <OPDVisitTypeScreen
            patient={selectedPatient}
            onSelect={(type) => handleNoteTypeSelected(type)}
            onBack={handleBackToDetail}
          />
        );

      case 'scratchpad':
        if (!selectedPatient || !scratchpadNoteType) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <ScratchpadScreen
            patient={selectedPatient}
            noteType={scratchpadNoteType}
            initialStrokes={scratchpadStrokes.length > 0 ? scratchpadStrokes : undefined}
            onNoteProcessed={handleNoteProcessed}
            onBack={() => setCurrentScreen('visit-type')}
          />
        );

      case 'note-review':
        if (!selectedPatient || !scratchpadNoteType || !scratchpadNote) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <ClinicalNoteReviewScreen
            noteType={scratchpadNoteType}
            note={scratchpadNote}
            patient={selectedPatient}
            strokes={scratchpadStrokes}
            onConfirmed={handleNoteConfirmed}
            onEditScribble={handleEditScribble}
            onBack={handleBackToDetail}
          />
        );

      default:
        return (
          <WardListScreen
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onAdmitPatient={handleAdmitPatient}
          />
        );
    }
  };

  return (
    <div id="klinik-app">
      {renderScreen()}
    </div>
  );
}

export default App;
