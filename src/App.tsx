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

/**
 * Root application component with simple state-based screen routing.
 * Patient data is loaded via the repository — swap implementations in createRepository.ts.
 * @returns The active screen based on current navigation state
 */

/** All possible application screens */
type Screen = 'setup' | 'list' | 'detail' | 'scribing' | 'typed-note' | 'orders' | 'amend' | 'admission';

function App() {
  const repository = useMemo(() => createRepository(), []);
  const [patients, setPatients] = useState<Patient[]>([]);
  // Show setup screen on first launch if no doctor profile exists yet
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    isProfileComplete() ? 'list' : 'setup'
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

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
