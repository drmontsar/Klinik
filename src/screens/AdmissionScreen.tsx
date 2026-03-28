import React, { useMemo, useEffect, useState } from 'react';
import { COLORS } from '../constants/colors';
import AdmissionForm from '../components/admission/AdmissionForm';
import { createRepository } from '../services/createRepository';
import { getDoctorProfile } from '../services/doctorProfile';
import type { Patient } from '../types/patient';

/**
 * Admission screen — admin panel for registering a new patient.
 * Collects demographics, admission details, and optional initial vitals.
 * On submission, creates the patient record via the repository and navigates
 * to the new patient's detail screen.
 *
 * @param onAdmitted - Called with the new patient's ID after successful admission
 * @param onCancel - Called when the admin cancels without admitting
 */
interface AdmissionScreenProps {
  onAdmitted: (patientId: string) => void;
  onCancel: () => void;
}

const AdmissionScreen: React.FC<AdmissionScreenProps> = ({ onAdmitted, onCancel }) => {
  const repository = useMemo(() => createRepository(), []);
  const [patientCount, setPatientCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current patient count to generate a sensible hospital number suggestion
  useEffect(() => {
    repository.getAllPatients().then(p => setPatientCount(p.length));
  }, [repository]);

  const handleSubmit = async (data: Omit<Patient, 'id'>) => {
    setSubmitting(true);
    setError(null);
    try {
      const patient = await repository.admitPatient(data);
      onAdmitted(patient.id);
    } catch (e) {
      setError('Admission failed. Please check all fields and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.surface,
        borderBottom: `1px solid ${COLORS.borderLight}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', color: COLORS.textMuted, padding: '4px',
            lineHeight: 1,
          }}
          aria-label="Back to ward list"
        >
          ←
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: COLORS.text }}>
            Admit New Patient
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: COLORS.textMuted }}>
            {getDoctorProfile()?.specialty ?? 'Ward Admissions'}
          </p>
        </div>
        {/* Admin badge */}
        <div style={{
          marginLeft: 'auto',
          padding: '4px 10px',
          backgroundColor: COLORS.purpleBg,
          color: COLORS.purple,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          Admin
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* Error banner */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: COLORS.redBg,
            border: `1px solid ${COLORS.redBorder}`,
            borderRadius: '10px',
            color: COLORS.red,
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submitting overlay message */}
        {submitting ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏥</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
              Admitting patient...
            </div>
          </div>
        ) : (
          <AdmissionForm
            onSubmit={handleSubmit}
            onCancel={onCancel}
            existingCount={patientCount}
          />
        )}
      </div>
    </div>
  );
};

export default AdmissionScreen;
