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
import SetupScreen from './screens/SetupScreen';
import OPDVisitTypeScreen from './screens/OPDVisitTypeScreen';
import NoteInputSelectorScreen from './screens/NoteInputSelectorScreen';
import DictateScreen from './screens/DictateScreen';
import TypeFormScreen from './screens/TypeFormScreen';
import ScratchpadScreen from './screens/ScratchpadScreen';
import ClinicalNoteReviewScreen from './screens/ClinicalNoteReviewScreen';
import type { NoteType } from './components/scratchpad/NoteTypeSelector';
import type { InputMethod, NewPatientInfo } from './screens/NoteInputSelectorScreen';
import type { Stroke, ScratchpadNote } from './hooks/useScratchpad';

/**
 * Root application component with simple state-based screen routing.
 * Patient data is loaded via the repository — swap implementations in createRepository.ts.
 * @returns The active screen based on current navigation state
 */

/** All possible application screens */
type Screen = 'setup' | 'list' | 'detail' | 'scribing' | 'typed-note' | 'orders' | 'amend' | 'admission' | 'visit-type' | 'note-input-selector' | 'dictate' | 'type-form' | 'scratchpad' | 'note-review';

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
  // Whether the current note was AI-generated (scribble/dictate) or typed manually
  const [scratchpadIsAIDraft, setScratchpadIsAIDraft] = useState(true);

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
   * Navigate to note input selector — the unified 3-tap entry for new patients.
   * The old AdmissionScreen typed form is no longer the primary path.
   */
  const handleAdmitPatient = () => {
    setSelectedPatientId(null);
    setCurrentScreen('note-input-selector');
  };

  /**
   * Handles the selection of input method and note type from NoteInputSelectorScreen.
   * For Scribble: navigates directly to the canvas (patient created at confirm).
   * For Type/Dictate + new patient: creates a minimal patient record immediately so
   * the existing NoteEntryScreen and ScribingScreen receive a valid patient.
   */
  const handleNoteInputSelected = async (
    method: InputMethod,
    noteType: NoteType,
    _newPatient?: NewPatientInfo,
  ) => {
    if (method === 'scribble') {
      // Patient may be null — ScratchpadScreen and ClinicalNoteReviewScreen handle this.
      setScratchpadNoteType(noteType);
      setScratchpadStrokes([]);
      setScratchpadIsAIDraft(true);
      setCurrentScreen('scratchpad');
      return;
    }

    if (method === 'dictate') {
      // Patient may be null — DictateScreen and ClinicalNoteReviewScreen handle this.
      setScratchpadNoteType(noteType);
      setScratchpadIsAIDraft(true);
      setCurrentScreen('dictate');
      return;
    }

    // Type — show a blank editable form for the selected note type.
    // Patient may be null — TypeFormScreen and ClinicalNoteReviewScreen handle this.
    setScratchpadNoteType(noteType);
    setScratchpadIsAIDraft(false);
    setCurrentScreen('type-form');
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
   * Note confirmed and saved — return to patient detail and clean up scratchpad state.
   * @param newPatientId - Set when ClinicalNoteReviewScreen created a new patient record.
   */
  const handleNoteConfirmed = (newPatientId?: string) => {
    repository.getAllPatients().then(setPatients);
    if (newPatientId) {
      setSelectedPatientId(newPatientId);
    }
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

      case 'note-input-selector':
        return (
          <NoteInputSelectorScreen
            patient={selectedPatient}
            onBack={selectedPatient ? handleBackToDetail : handleBackToList}
            onSelect={handleNoteInputSelected}
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

      case 'dictate':
        if (!scratchpadNoteType) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <DictateScreen
            patient={selectedPatient ?? null}
            noteType={scratchpadNoteType}
            onNoteProcessed={handleNoteProcessed}
            onBack={() => setCurrentScreen('note-input-selector')}
          />
        );

      case 'type-form':
        if (!scratchpadNoteType) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <TypeFormScreen
            patient={selectedPatient ?? null}
            noteType={scratchpadNoteType}
            onNoteProcessed={handleNoteProcessed}
            onBack={() => setCurrentScreen('note-input-selector')}
          />
        );

      case 'scratchpad':
        // selectedPatient may be null for new patients — ScratchpadScreen handles it
        if (!scratchpadNoteType) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <ScratchpadScreen
            patient={selectedPatient ?? null}
            noteType={scratchpadNoteType}
            initialStrokes={scratchpadStrokes.length > 0 ? scratchpadStrokes : undefined}
            onNoteProcessed={handleNoteProcessed}
            onBack={() => selectedPatient ? setCurrentScreen('visit-type') : setCurrentScreen('note-input-selector')}
          />
        );

      case 'note-review':
        // selectedPatient may be null for new-patient scribble
        if (!scratchpadNoteType || !scratchpadNote) {
          setCurrentScreen('list');
          return null;
        }
        return (
          <ClinicalNoteReviewScreen
            noteType={scratchpadNoteType}
            note={scratchpadNote}
            patient={selectedPatient ?? null}
            strokes={scratchpadStrokes}
            onConfirmed={handleNoteConfirmed}
            onEditScribble={handleEditScribble}
            onBack={handleBackToDetail}
            isAIDraft={scratchpadIsAIDraft}
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
