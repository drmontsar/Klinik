import React, { useState } from 'react';
import { COLORS } from '../constants/colors';
import { saveDoctorProfile } from '../services/doctorProfile';
import type { DoctorProfile } from '../services/doctorProfile';

/**
 * First-launch setup screen — collected once, stored in localStorage.
 * Shown automatically when no doctor profile exists.
 *
 * Collects:
 *   - Doctor's full name (appears on every signed note and audit record)
 *   - Specialty / department (shapes the AI clinical documentation prompt)
 *   - Hospital name (shown in note exports and audit trail)
 *   - Hospital number prefix (used in MRN generation e.g. "KLK-2026-0001")
 *
 * @param onComplete - Called after profile is saved; app proceeds to ward list
 */
const SetupScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalNumberPrefix, setHospitalNumberPrefix] = useState('');
  const [errors, setErrors] = useState<Partial<DoctorProfile>>({});

  const validate = (): boolean => {
    const e: Partial<DoctorProfile> = {};
    if (!doctorName.trim()) e.doctorName = 'Your name is required — it appears on every signed note';
    if (!specialty.trim()) e.specialty = 'Specialty is required — it shapes the AI clinical prompt';
    if (!hospitalName.trim()) e.hospitalName = 'Hospital name is required';
    if (!hospitalNumberPrefix.trim()) e.hospitalNumberPrefix = 'Hospital number prefix is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveDoctorProfile({
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      hospitalName: hospitalName.trim(),
      hospitalNumberPrefix: hospitalNumberPrefix.trim().toUpperCase(),
    });
    onComplete();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: '10px',
    fontSize: '15px',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.text,
    display: 'block',
    marginBottom: '6px',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '12px',
    color: COLORS.textMuted,
    marginTop: '4px',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: COLORS.red,
    marginTop: '4px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo / title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.brand, margin: '0 0 8px' }}>
            Welcome to KliniK
          </h1>
          <p style={{ fontSize: '15px', color: COLORS.textMuted, margin: 0 }}>
            Set up your profile once. Your name will appear on every note you sign.
          </p>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>

          {/* Doctor name */}
          <div>
            <label style={labelStyle}>Your full name *</label>
            <input
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Meera Iyer"
              style={inputStyle}
              autoFocus
            />
            <p style={hintStyle}>Appears on every signed note, amendment, and order</p>
            {errors.doctorName && <p style={errorStyle}>{errors.doctorName}</p>}
          </div>

          {/* Specialty */}
          <div>
            <label style={labelStyle}>Specialty / Department *</label>
            <input
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              placeholder="e.g. Surgical Oncology, Cardiology, Paediatrics"
              style={inputStyle}
            />
            <p style={hintStyle}>Used to tailor the AI note-generation prompt to your clinical context</p>
            {errors.specialty && <p style={errorStyle}>{errors.specialty}</p>}
          </div>

          {/* Hospital name */}
          <div>
            <label style={labelStyle}>Hospital name *</label>
            <input
              value={hospitalName}
              onChange={e => setHospitalName(e.target.value)}
              placeholder="e.g. Sunshine Hospital, Bengaluru"
              style={inputStyle}
            />
            <p style={hintStyle}>Shown on exported notes and in the audit trail</p>
            {errors.hospitalName && <p style={errorStyle}>{errors.hospitalName}</p>}
          </div>

          {/* Hospital number prefix */}
          <div>
            <label style={labelStyle}>Hospital number prefix *</label>
            <input
              value={hospitalNumberPrefix}
              onChange={e => setHospitalNumberPrefix(e.target.value)}
              placeholder="e.g. KLK, RMH, AIIMS"
              maxLength={8}
              style={{ ...inputStyle, width: '160px' }}
            />
            <p style={hintStyle}>
              Patient MRNs will be formatted as{' '}
              <strong style={{ color: COLORS.text }}>
                {hospitalNumberPrefix.trim().toUpperCase() || 'PREFIX'}-{new Date().getFullYear()}-0001
              </strong>
            </p>
            {errors.hospitalNumberPrefix && <p style={errorStyle}>{errors.hospitalNumberPrefix}</p>}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: COLORS.brand,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Save and Continue →
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: COLORS.textDim, marginTop: '20px' }}>
          Profile is stored on this device only. You can update it later from Settings.
        </p>
      </div>
    </div>
  );
};

export default SetupScreen;
