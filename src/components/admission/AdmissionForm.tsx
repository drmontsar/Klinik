import React, { useState } from 'react';
import { COLORS } from '../../constants/colors';
import TemplateField from '../scribing/TemplateField';
import PlanTagInput from '../scribing/PlanTagInput';
import type { Patient, Vitals, ConsciousnessLevel } from '../../types/patient';
import { getDoctorProfile } from '../../services/doctorProfile';

/**
 * Admission form — all fields required for admitting a new patient.
 * Calls onSubmit with a complete Patient object (minus id, which is
 * assigned by the repository).
 *
 * @param onSubmit - Called with a complete patient data object on valid submission
 * @param onCancel - Called when the admin cancels without admitting
 * @param existingCount - Used to pre-fill a suggested hospital number
 */
interface AdmissionFormProps {
  onSubmit: (data: Omit<Patient, 'id'>) => void;
  onCancel: () => void;
  existingCount: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '8px', fontSize: '14px', color: COLORS.text,
  backgroundColor: COLORS.surface, fontFamily: 'inherit', boxSizing: 'border-box',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px', color: COLORS.textMuted, display: 'block', marginBottom: '4px',
};

const sectionHeadStyle = (color: string = COLORS.text): React.CSSProperties => ({
  fontSize: '13px', fontWeight: 700, color, marginBottom: '4px',
  display: 'flex', alignItems: 'center', gap: '6px',
});

const AdmissionForm: React.FC<AdmissionFormProps> = ({ onSubmit, onCancel, existingCount }) => {
  // Demographics
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Patient['sex']>('Male');
  const prefix = getDoctorProfile()?.hospitalNumberPrefix ?? 'KLK';
  const suggestedHospNum = `${prefix}-${new Date().getFullYear()}-${String(existingCount + 1).padStart(4, '0')}`;
  const [hospitalNumber, setHospitalNumber] = useState(suggestedHospNum);
  const [abhaId, setAbhaId] = useState('');

  // Admission details
  const [ward, setWard] = useState('');
  const [bed, setBed] = useState('');
  const [consultant, setConsultant] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Clinical — optional
  const [problems, setProblems] = useState<string[]>([]);
  const [summary, setSummary] = useState('');

  // Vitals — all optional at admission
  const [temp, setTemp] = useState('');
  const [hr, setHr] = useState('');
  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [rr, setRr] = useState('');
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>('alert');
  const [onO2, setOnO2] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Patient name is required';
    if (!age || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 150)
      e.age = 'Valid age required (0–150)';
    if (!hospitalNumber.trim()) e.hospitalNumber = 'Hospital number is required';
    if (!ward.trim()) e.ward = 'Ward is required';
    if (!bed.trim()) e.bed = 'Bed number is required';
    if (!consultant.trim()) e.consultant = 'Consultant name is required';
    if (!diagnosis.trim()) e.diagnosis = 'Primary diagnosis is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // SAFETY: Vitals are NUMERIC or 0 (for unentered). Never strings.
    const vitals: Vitals = {
      temperature: parseFloat(temp) || 0,
      heartRate: parseInt(hr) || 0,
      systolicBP: parseInt(sbp) || 0,
      diastolicBP: parseInt(dbp) || 0,
      spO2: parseInt(spo2) || 0,
      respirationRate: parseInt(rr) || 0,
      consciousness,
      onSupplementalO2: onO2,
      spO2Scale: 1,
      recordedAt: new Date().toISOString(),
    };

    onSubmit({
      status: 'active',
      name: name.trim(),
      age: Number(age),
      sex,
      hospitalNumber: hospitalNumber.trim(),
      location: `${ward.trim()}, Bed ${bed.trim()}`,
      consultant: consultant.trim(),
      diagnosis: diagnosis.trim(),
      admissionDate,
      dayOfStay: 0,
      problems,
      vitals,
      // CLINICAL: NEWS2 starts at 0 — recalculated once proper vitals are recorded
      news2Score: 0,
      medications: [],
      investigations: [],
      notes: [],
      amendments: [],
      summary: summary.trim(),
    });
  };

  const err = (field: string) =>
    errors[field] ? (
      <span style={{ fontSize: '11px', color: COLORS.red, marginTop: '2px', display: 'block' }}>
        {errors[field]}
      </span>
    ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Patient Details */}
      <div style={sectionStyle}>
        <div style={sectionHeadStyle(COLORS.brand)}>🧑‍⚕️ Patient Details</div>

        <TemplateField label="Full Name *" value={name} onChange={setName}
          category="assessment" placeholder="e.g. Rajesh Kumar" />
        {err('name')}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Age (years) *</label>
            {/* SAFETY: type=number enforces numeric-only age input */}
            <input type="number" min={0} max={150} value={age}
              onChange={e => setAge(e.target.value)} placeholder="e.g. 62" style={inputStyle} />
            {err('age')}
          </div>
          <div>
            <label style={labelStyle}>Sex *</label>
            <select value={sex} onChange={e => setSex(e.target.value as Patient['sex'])} style={inputStyle}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Hospital Number *</label>
            <input value={hospitalNumber} onChange={e => setHospitalNumber(e.target.value)}
              style={inputStyle} />
            {err('hospitalNumber')}
          </div>
          <div>
            <label style={labelStyle}>ABHA ID <span style={{ color: COLORS.textDim }}>(optional)</span></label>
            <input value={abhaId} onChange={e => setAbhaId(e.target.value)}
              placeholder="14-digit ABHA number" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Admission Details */}
      <div style={sectionStyle}>
        <div style={sectionHeadStyle(COLORS.blue)}>🏥 Admission Details</div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Ward *</label>
            <input value={ward} onChange={e => setWard(e.target.value)}
              placeholder="e.g. Ward 4, Surgical Oncology" style={inputStyle} />
            {err('ward')}
          </div>
          <div>
            <label style={labelStyle}>Bed *</label>
            <input value={bed} onChange={e => setBed(e.target.value)}
              placeholder="e.g. 12A" style={inputStyle} />
            {err('bed')}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Consultant *</label>
          <input value={consultant} onChange={e => setConsultant(e.target.value)}
            placeholder="e.g. Dr. Meera Iyer" style={inputStyle} />
          {err('consultant')}
        </div>

        <TemplateField label="Primary Diagnosis / Reason for Admission *"
          value={diagnosis} onChange={setDiagnosis} category="assessment"
          placeholder="e.g. Carcinoma head of pancreas — for Whipple procedure" />
        {err('diagnosis')}

        <div>
          <label style={labelStyle}>Admission Date</label>
          <input type="date" value={admissionDate}
            onChange={e => setAdmissionDate(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
        </div>
      </div>

      {/* Active Problems */}
      <div style={sectionStyle}>
        <div style={sectionHeadStyle(COLORS.amber)}>⚠️ Active Problems <span style={{ fontWeight: 400, color: COLORS.textDim, fontSize: '12px' }}>— optional, press Enter to add</span></div>
        <PlanTagInput items={problems} onChange={setProblems}
          color={COLORS.amber} bg={COLORS.amberBg}
          placeholder="e.g. Post-op ileus, Pain uncontrolled"
          category="assessment" />
      </div>

      {/* Initial Vitals */}
      <div style={sectionStyle}>
        <div style={sectionHeadStyle(COLORS.green)}>
          📊 Initial Vitals
          <span style={{ fontWeight: 400, color: COLORS.textDim, fontSize: '12px' }}>— optional, enter what is available at admission</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {([
            { label: 'Temp (°C)', val: temp, set: setTemp },
            { label: 'HR (bpm)', val: hr, set: setHr },
            { label: 'SBP (mmHg)', val: sbp, set: setSbp },
            { label: 'DBP (mmHg)', val: dbp, set: setDbp },
            { label: 'SpO₂ (%)', val: spo2, set: setSpo2 },
            { label: 'RR (/min)', val: rr, set: setRr },
          ] as const).map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ ...labelStyle, fontSize: '11px' }}>{label}</label>
              {/* SAFETY: type=number enforces numeric-only vital sign input */}
              <input type="number" value={val} onChange={e => set(e.target.value)}
                placeholder="—" style={{ ...inputStyle, padding: '7px 10px' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Consciousness</label>
            <select value={consciousness}
              onChange={e => setConsciousness(e.target.value as ConsciousnessLevel)}
              style={{ ...inputStyle, width: 'auto' }}>
              <option value="alert">Alert</option>
              <option value="confusion">Confusion</option>
              <option value="voice">Voice</option>
              <option value="pain">Pain</option>
              <option value="unresponsive">Unresponsive</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: COLORS.textSecondary, marginTop: '16px', cursor: 'pointer' }}>
            <input type="checkbox" checked={onO2} onChange={e => setOnO2(e.target.checked)} />
            On supplemental O₂
          </label>
        </div>
      </div>

      {/* Handover summary */}
      <div style={sectionStyle}>
        <div style={sectionHeadStyle()}>📝 Admission Summary <span style={{ fontWeight: 400, color: COLORS.textDim, fontSize: '12px' }}>— optional</span></div>
        <textarea value={summary} onChange={e => setSummary(e.target.value)}
          rows={3} placeholder="Brief clinical context, reason for admission, any immediate concerns..."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', minHeight: '70px' }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '11px 24px', backgroundColor: 'transparent', color: COLORS.textSecondary,
          border: `1px solid ${COLORS.borderLight}`, borderRadius: '10px',
          fontSize: '14px', fontWeight: 500, cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button onClick={handleSubmit} style={{
          padding: '11px 28px', backgroundColor: COLORS.brand, color: COLORS.surface,
          border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
          cursor: 'pointer',
        }}>
          Admit Patient →
        </button>
      </div>
    </div>
  );
};

export default AdmissionForm;
