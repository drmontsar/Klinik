import { useState, useEffect, useMemo } from 'react';
import type { Patient } from './types/patient';
import { createRepository } from './services/createRepository';
import WardListScreen from './screens/WardListScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';
import ScribingScreen from './screens/ScribingScreen';
import OrdersScreen from './screens/OrdersScreen';
import AmendmentScreenPage from './screens/AmendmentScreen';

/**
 * Root application component with simple state-based screen routing.
 * Patient data is loaded via the repository — swap implementations in createRepository.ts.
 * @returns The active screen based on current navigation state
 */

/** All possible application screens */
type Screen = 'list' | 'detail' | 'scribing' | 'orders' | 'amend';

function App() {
  const repository = useMemo(() => createRepository(), []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
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
      case 'list':
        return (
          <WardListScreen
            patients={patients}
            onSelectPatient={handleSelectPatient}
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
