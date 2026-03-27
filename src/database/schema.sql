-- =============================================================================
-- KliniK Rounds — PostgreSQL Schema
-- Module 1.1: Rounds Companion
-- Database: klinik_dev
-- Region (production): AWS RDS ap-south-1 (Mumbai)
--
-- Architecture principles enforced here:
--   1. Immutable records — amendments, never deletion.
--      No DELETE is ever issued on clinical tables.
--   2. Structured data from first moment.
--      SOAP notes stored as typed columns + JSONB arrays, never plain text.
--   3. Audit trail — every clinical action is logged, append-only.
--   4. SAFETY annotations on every column touching medication or vitals.
--   5. FHIR R4 alignment on identifiers and resource shapes.
--   6. ABDM / DPDP Act 2023 — ABHA ID column on patients.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Bootstrap: extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- GIN indexes on composite + JSONB


-- =============================================================================
-- SECTION 1: IDENTITY
-- Users of the system — doctors, nurses, pharmacists, lab, admin.
-- Referenced by nearly every other table for authorship and audit.
-- =============================================================================

CREATE TABLE clinicians (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    -- ABDM: designation as recognised by the National Medical Register
    designation     TEXT,
    role            TEXT        NOT NULL
                    CHECK (role IN ('doctor', 'nurse', 'pharmacist',
                                    'lab', 'radiologist', 'admin')),
    department      TEXT,
    employee_id     TEXT        UNIQUE,
    -- NMR / nursing council registration number for NABH compliance
    registration_no TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  clinicians                 IS 'All clinical and administrative staff. Never deleted — set is_active=false.';
COMMENT ON COLUMN clinicians.role            IS 'doctor=read/write own patients. nurse=tasks+vitals. pharmacist=orders. lab=investigations. admin=read-all.';
COMMENT ON COLUMN clinicians.registration_no IS 'NMR (National Medical Register) or state nursing council number. Required for NABH accreditation.';


-- =============================================================================
-- SECTION 2: PATIENTS
-- Core patient record. One row per patient (not per admission).
-- Admission episodes are tracked in the encounters table.
-- =============================================================================

CREATE TABLE patients (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_number   TEXT        NOT NULL UNIQUE,  -- e.g. KLK-2026-0451

    -- ABDM compliance: Ayushman Bharat Health Account 14-digit identifier
    abha_id           TEXT        UNIQUE,

    -- Demographics
    name              TEXT        NOT NULL,
    age               SMALLINT    NOT NULL CHECK (age BETWEEN 0 AND 150),
    sex               TEXT        NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
    date_of_birth     DATE,

    -- Current admission state (denormalised from latest encounter for fast list queries)
    ward              TEXT        NOT NULL DEFAULT '',
    bed               TEXT        NOT NULL DEFAULT '',
    consultant_id     UUID        REFERENCES clinicians(id),
    primary_diagnosis TEXT        NOT NULL DEFAULT '',
    admission_date    DATE,

    -- CLINICAL: status drives ward list filtering.
    status            TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'discharged', 'transferred', 'deceased')),

    -- CLINICAL: NEWS2 cached score — updated every time a vitals row is inserted.
    -- SAFETY: Never display this without checking vitals.news2_is_complete.
    news2_score       SMALLINT,

    summary           TEXT,       -- overnight / handover brief
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  patients              IS 'Master patient record. One row per patient. Never deleted — set status=discharged or deceased.';
COMMENT ON COLUMN patients.news2_score  IS 'SAFETY: Cached from latest vitals row. Only display when vitals.news2_is_complete=true.';
COMMENT ON COLUMN patients.abha_id      IS 'ABDM: Ayushman Bharat Health Account ID. 14-digit alphanumeric. Unique across the system.';

CREATE INDEX idx_patients_status        ON patients (status);
CREATE INDEX idx_patients_news2         ON patients (news2_score DESC NULLS LAST);
CREATE INDEX idx_patients_consultant    ON patients (consultant_id);
CREATE INDEX idx_patients_hosp_no       ON patients (hospital_number);


-- =============================================================================
-- SECTION 3: ENCOUNTERS
-- One row per hospital admission episode.
-- A patient may have multiple encounters (readmissions).
-- SignedSOAPNote.encounterId maps to this table.
-- =============================================================================

CREATE TABLE encounters (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id),
    admission_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
    discharge_date  DATE,
    ward            TEXT        NOT NULL,
    bed             TEXT        NOT NULL,
    consultant_id   UUID        REFERENCES clinicians(id),
    -- day_of_stay computed at query time: CURRENT_DATE - admission_date
    status          TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'discharged', 'transferred')),
    discharge_summary TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE encounters IS 'Admission episode. day_of_stay = CURRENT_DATE - admission_date, computed at query time to avoid stale cached values.';

CREATE INDEX idx_encounters_patient  ON encounters (patient_id);
CREATE INDEX idx_encounters_status   ON encounters (status);


-- =============================================================================
-- SECTION 4: VITALS
-- Time-series vital sign observations. Many rows per patient / encounter.
-- SAFETY: All vital sign values are NUMERIC or NULL. Never TEXT.
-- SAFETY: NEWS2 must only be displayed when news2_is_complete = true.
-- NEWS2 thresholds are from CLAUDE.md — Royal College of Physicians mandated.
-- =============================================================================

CREATE TABLE vitals (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id            UUID        NOT NULL REFERENCES patients(id),
    encounter_id          UUID        REFERENCES encounters(id),
    recorded_by           UUID        REFERENCES clinicians(id),
    recorded_at           TIMESTAMPTZ NOT NULL,

    -- SAFETY: NUMERIC/SMALLINT types enforce numeric-only storage.
    -- Range CHECK constraints mirror NEWS2 threshold boundaries.
    -- Violations are rejected at DB level — not only at app level.

    -- Temperature: valid clinical range 30.0–45.0 °C
    temperature           NUMERIC(4,1) CHECK (temperature BETWEEN 30.0 AND 45.0),

    -- Heart rate: 0–300 bpm
    heart_rate            SMALLINT     CHECK (heart_rate BETWEEN 0 AND 300),

    -- Blood pressure
    systolic_bp           SMALLINT     CHECK (systolic_bp BETWEEN 0 AND 300),
    diastolic_bp          SMALLINT     CHECK (diastolic_bp BETWEEN 0 AND 200),

    -- SpO2: 0–100 %
    spo2                  SMALLINT     CHECK (spo2 BETWEEN 0 AND 100),

    -- Respiratory rate: 0–60 breaths/min
    respiratory_rate      SMALLINT     CHECK (respiratory_rate BETWEEN 0 AND 60),

    -- Consciousness: ACVPU scale used by NEWS2
    consciousness         TEXT         NOT NULL DEFAULT 'alert'
                          CHECK (consciousness IN
                                 ('alert', 'confusion', 'voice', 'pain', 'unresponsive')),

    on_supplemental_o2    BOOLEAN      NOT NULL DEFAULT false,

    -- CLINICAL: SpO2 Scale 2 is ONLY for confirmed hypercapnic respiratory failure
    -- (COPD patients with target SpO2 88–92%). Default Scale 1 for all others.
    -- Incorrectly applying Scale 2 changes scoring thresholds — patient safety issue.
    spo2_scale            SMALLINT     NOT NULL DEFAULT 1 CHECK (spo2_scale IN (1, 2)),

    -- SAFETY: news2_score is only valid when news2_is_complete = true.
    -- If any parameter is missing, news2_is_complete = false and
    -- the UI must show "NEWS2 incomplete — missing: [param list]"
    -- A partial score that looks complete is more dangerous than no score.
    news2_score           SMALLINT,
    news2_is_complete     BOOLEAN      NOT NULL DEFAULT false,
    news2_missing_params  TEXT[]       NOT NULL DEFAULT '{}',

    -- Parameter breakdown stored for audit trail and clinical detail view
    news2_breakdown       JSONB,

    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  vitals                      IS 'SAFETY: Time-series vital signs. All values NUMERIC or NULL. Display NEWS2 only when news2_is_complete=true.';
COMMENT ON COLUMN vitals.spo2_scale           IS 'CLINICAL: Scale 2 ONLY for confirmed hypercapnic respiratory failure (COPD SpO2 target 88–92%). Default Scale 1.';
COMMENT ON COLUMN vitals.news2_is_complete    IS 'SAFETY: false = at least one NEWS2 parameter is missing. UI must show incomplete warning, not a partial score.';
COMMENT ON COLUMN vitals.news2_missing_params IS 'SAFETY: Names of parameters missing from this observation. Displayed to clinician so they know what to complete.';

CREATE INDEX idx_vitals_patient_time  ON vitals (patient_id, recorded_at DESC);
CREATE INDEX idx_vitals_encounter     ON vitals (encounter_id);
CREATE INDEX idx_vitals_time          ON vitals (recorded_at DESC);


-- =============================================================================
-- SECTION 5: PROBLEMS
-- Active problem list. Many problems per patient.
-- CLINICAL: Problems are never deleted. Set status = 'resolved'.
-- =============================================================================

CREATE TABLE problems (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID        NOT NULL REFERENCES patients(id),
    encounter_id  UUID        REFERENCES encounters(id),
    description   TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'resolved', 'monitoring')),
    added_by      UUID        REFERENCES clinicians(id),
    added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ,
    resolved_by   UUID        REFERENCES clinicians(id),
    sort_order    SMALLINT    NOT NULL DEFAULT 0   -- lower = shown higher in list
);

COMMENT ON TABLE problems IS 'CLINICAL: Active problem list. Never deleted — set status=resolved. Sort by sort_order ASC, added_at ASC.';

CREATE INDEX idx_problems_patient  ON problems (patient_id);
CREATE INDEX idx_problems_status   ON problems (patient_id, status);


-- =============================================================================
-- SECTION 6: CLINICAL NOTES
-- Signed SOAP notes — the canonical clinical record.
-- CLINICAL: Immutable once signed. Errors are formally amended, never corrected
-- in place. This is the legally defensible approach.
-- Structured SOAP stored as typed columns + JSONB arrays — never plain text.
-- =============================================================================

CREATE TABLE clinical_notes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       UUID        NOT NULL REFERENCES patients(id),
    encounter_id     UUID        REFERENCES encounters(id),

    note_type        TEXT        NOT NULL DEFAULT 'ward-round'
                     CHECK (note_type IN ('ward-round', 'progress', 'admission',
                                          'discharge', 'procedure')),

    -- Which pipeline produced this note — drives the vendor dashboard
    generation_method TEXT       NOT NULL
                      CHECK (generation_method IN (
                          'medASR + claude',
                          'web-speech + claude',
                          'typed-template',
                          'typed-natural-language',
                          'manual'
                      )),

    -- -------------------------------------------------------------------------
    -- SUBJECTIVE — structured, not a single text blob
    -- -------------------------------------------------------------------------
    chief_complaint   TEXT,
    symptoms          JSONB       NOT NULL DEFAULT '[]'::jsonb,  -- string[]
    pain_score        SMALLINT    CHECK (pain_score BETWEEN 0 AND 10),
    patient_statement TEXT,

    -- -------------------------------------------------------------------------
    -- OBJECTIVE — vitals extracted from the consultation transcript
    -- SAFETY: All fields NUMERIC or NULL. Range constraints at column level.
    -- These are the doctor-reviewed values, not raw sensor readings.
    -- -------------------------------------------------------------------------
    obj_temperature       NUMERIC(4,1) CHECK (obj_temperature BETWEEN 30.0 AND 45.0),
    obj_heart_rate        SMALLINT     CHECK (obj_heart_rate BETWEEN 0 AND 300),
    obj_systolic_bp       SMALLINT     CHECK (obj_systolic_bp BETWEEN 0 AND 300),
    obj_diastolic_bp      SMALLINT     CHECK (obj_diastolic_bp BETWEEN 0 AND 200),
    obj_spo2              SMALLINT     CHECK (obj_spo2 BETWEEN 0 AND 100),
    obj_respiratory_rate  SMALLINT     CHECK (obj_respiratory_rate BETWEEN 0 AND 60),
    obj_findings          JSONB        NOT NULL DEFAULT '[]'::jsonb,  -- string[]

    -- -------------------------------------------------------------------------
    -- ASSESSMENT
    -- -------------------------------------------------------------------------
    primary_diagnosis        TEXT   NOT NULL DEFAULT '',
    active_problems_summary  TEXT,
    clinical_reasoning       TEXT,

    -- -------------------------------------------------------------------------
    -- PLAN — stored as typed JSONB arrays, never a single text block
    -- SAFETY: plan_medications entries are NOT confirmed orders.
    --         See medications and orders tables for confirmed state.
    --         These are always unchecked by default in the review screen.
    -- -------------------------------------------------------------------------
    plan_investigations  JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string[]
    plan_medications     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- SAFETY: unchecked
    plan_nursing         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string[]
    plan_follow_up       JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string[]
    plan_all_items       JSONB NOT NULL DEFAULT '[]'::jsonb,  -- string[]

    -- -------------------------------------------------------------------------
    -- DISPLAY TEXT — human-readable sections for the doctor review screen
    -- Generated from structured fields above. Stored for fast retrieval.
    -- -------------------------------------------------------------------------
    display_subjective  TEXT,
    display_objective   TEXT,
    display_assessment  TEXT,
    display_plan        TEXT,

    -- -------------------------------------------------------------------------
    -- SIGNING METADATA
    -- -------------------------------------------------------------------------
    signed_by                   UUID        REFERENCES clinicians(id),
    signed_at                   TIMESTAMPTZ,
    is_signed                   BOOLEAN     NOT NULL DEFAULT false,
    consultation_duration_secs  INTEGER     CHECK (consultation_duration_secs >= 0),

    -- CLINICAL: Short consultations (<60 seconds) must be flagged on review.
    -- Display: "Short consultation — verify this note is complete"
    is_short_consultation  BOOLEAN  GENERATED ALWAYS AS
                           (consultation_duration_secs IS NOT NULL
                            AND consultation_duration_secs < 60) STORED,

    -- How many times the doctor edited AI output before signing
    manual_corrections_count  SMALLINT  NOT NULL DEFAULT 0,

    -- CLINICAL: is_active=false means superseded by an amendment.
    -- The original row is kept permanently. is_active drives display logic only.
    -- Never set is_active=false without creating a corresponding amendment row.
    is_active  BOOLEAN  NOT NULL DEFAULT true,

    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
    -- No updated_at — clinical notes are immutable once created.
);

COMMENT ON TABLE  clinical_notes                   IS 'CLINICAL: Immutable once signed. Errors corrected via amendments table only. A hospital that amends wins in court; a hospital that deletes loses in court.';
COMMENT ON COLUMN clinical_notes.plan_medications  IS 'SAFETY: Plan text strings, NOT confirmed orders. Always unchecked by default in the review screen. Confirmed orders live in the medications and orders tables.';
COMMENT ON COLUMN clinical_notes.is_short_consultation IS 'CLINICAL: Auto-set when consultation_duration_secs < 60. UI must display warning: "Short consultation — verify this note is complete".';
COMMENT ON COLUMN clinical_notes.is_active         IS 'CLINICAL: false = superseded by amendment. Original row preserved permanently. Never set false without an amendment row.';

CREATE INDEX idx_notes_patient_time  ON clinical_notes (patient_id, created_at DESC);
CREATE INDEX idx_notes_encounter     ON clinical_notes (encounter_id);
CREATE INDEX idx_notes_signed        ON clinical_notes (signed_at DESC) WHERE is_signed = true;
CREATE INDEX idx_notes_diag_fts      ON clinical_notes USING gin (to_tsvector('english', primary_diagnosis));
CREATE INDEX idx_notes_symptoms_gin  ON clinical_notes USING gin (symptoms);
CREATE INDEX idx_notes_plan_meds_gin ON clinical_notes USING gin (plan_medications);
CREATE INDEX idx_notes_plan_inv_gin  ON clinical_notes USING gin (plan_investigations);


-- =============================================================================
-- SECTION 7: AMENDMENTS
-- Immutable amendment records. Append-only — no UPDATE, no DELETE, ever.
-- CLINICAL: The amendment workflow is the legally correct approach.
-- Original note preserved permanently. The amendment is the correction.
-- =============================================================================

CREATE TABLE amendments (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id       UUID        NOT NULL REFERENCES clinical_notes(id),
    patient_id    UUID        NOT NULL REFERENCES patients(id),

    -- SOAP section that was amended — enables section-level diff view
    section       TEXT        NOT NULL
                  CHECK (section IN ('subjective', 'objective',
                                     'assessment', 'plan', 'full')),

    -- CLINICAL: Original text preserved verbatim for medico-legal purposes
    original_text TEXT        NOT NULL,
    amended_text  TEXT        NOT NULL,

    -- CLINICAL: Reason is mandatory. No silent amendments ever.
    -- "Wrong patient" entries quarantine the note — reason must reflect this.
    reason        TEXT        NOT NULL CHECK (length(trim(reason)) > 0),

    amended_by    UUID        NOT NULL REFERENCES clinicians(id),
    amended_at    TIMESTAMPTZ NOT NULL DEFAULT now()

    -- No updated_at. No deleted_at. Append-only by design.
    -- Enforced by REVOKE UPDATE, DELETE ON amendments (see GRANTS section).
);

COMMENT ON TABLE  amendments               IS 'CLINICAL: Append-only. No UPDATE, no DELETE ever. Original note is preserved permanently. Reason is mandatory — empty string rejected by CHECK constraint.';
COMMENT ON COLUMN amendments.original_text IS 'CLINICAL: Verbatim content before amendment. Preserved permanently for medico-legal purposes.';
COMMENT ON COLUMN amendments.reason        IS 'CLINICAL: Must describe why the amendment was made. For wrong-patient entries: reason must state this explicitly.';

CREATE INDEX idx_amendments_note      ON amendments (note_id);
CREATE INDEX idx_amendments_patient   ON amendments (patient_id);
CREATE INDEX idx_amendments_time      ON amendments (amended_at DESC);


-- =============================================================================
-- SECTION 8: MEDICATIONS
-- Medication orders. One row per prescription line.
-- SAFETY: is_confirmed must be set to true only by explicit doctor action.
--         Auto-confirmation is never permitted.
--         A medication confirmed without doctor intent is a patient safety event.
-- =============================================================================

CREATE TABLE medications (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id),
    encounter_id    UUID        REFERENCES encounters(id),
    -- note_id links to the SOAP note that generated this order.
    -- Nullable: medications can be prescribed outside a note (e.g. on admission).
    note_id         UUID        REFERENCES clinical_notes(id),

    drug_name       TEXT        NOT NULL,
    dose            TEXT        NOT NULL,
    route           TEXT        NOT NULL
                    CHECK (route IN ('oral', 'IV', 'IM', 'SC',
                                     'topical', 'inhaled', 'PR', 'SL', 'NGT', 'other')),
    frequency       TEXT        NOT NULL,
    indication      TEXT,

    -- SAFETY: is_confirmed = false by default.
    -- Never set to true automatically — only on explicit doctor confirmation tap.
    is_confirmed    BOOLEAN     NOT NULL DEFAULT false,
    is_active       BOOLEAN     NOT NULL DEFAULT true,

    start_date      DATE        NOT NULL DEFAULT CURRENT_DATE,
    end_date        DATE,

    prescribed_by   UUID        REFERENCES clinicians(id),
    confirmed_by    UUID        REFERENCES clinicians(id),
    confirmed_at    TIMESTAMPTZ,

    -- SAFETY: confirmed_by and confirmed_at must both be set if is_confirmed=true.
    CONSTRAINT medication_confirmation_integrity
        CHECK (
            is_confirmed = false
            OR (is_confirmed = true
                AND confirmed_by IS NOT NULL
                AND confirmed_at IS NOT NULL)
        ),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  medications              IS 'SAFETY: is_confirmed=false by default. Auto-confirmation never permitted. An unintended medication confirmation is a patient safety event.';
COMMENT ON COLUMN medications.is_confirmed IS 'SAFETY: Set to true only by explicit doctor tap on the confirmation screen. Never set programmatically without a confirmed_by clinician_id.';

CREATE INDEX idx_meds_patient      ON medications (patient_id);
CREATE INDEX idx_meds_encounter    ON medications (encounter_id);
CREATE INDEX idx_meds_note         ON medications (note_id);
CREATE INDEX idx_meds_active       ON medications (patient_id, is_active) WHERE is_active = true;
CREATE INDEX idx_meds_unconfirmed  ON medications (patient_id) WHERE is_confirmed = false AND is_active = true;


-- =============================================================================
-- SECTION 9: INVESTIGATIONS
-- Investigation orders and results.
-- Status lifecycle: ordered → sent → resulted | critical | cancelled
-- CLINICAL: Critical results require immediate clinician notification.
-- =============================================================================

CREATE TABLE investigations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id),
    encounter_id    UUID        REFERENCES encounters(id),
    note_id         UUID        REFERENCES clinical_notes(id),

    test_name       TEXT        NOT NULL,

    status          TEXT        NOT NULL DEFAULT 'ordered'
                    CHECK (status IN ('ordered', 'sent', 'resulted', 'critical', 'cancelled')),

    -- Result fields — null until resulted
    -- result_value is TEXT to accommodate ranges, qualitative values, and narratives
    result_value    TEXT,
    result_unit     TEXT,
    normal_range    TEXT,
    is_abnormal     BOOLEAN,

    -- CLINICAL: Critical results require immediate notification to ordering clinician.
    -- Never silently store a critical result without triggering the alert pipeline.
    is_critical     BOOLEAN     NOT NULL DEFAULT false,

    ordered_by      UUID        REFERENCES clinicians(id),
    ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resulted_at     TIMESTAMPTZ,
    resulted_by     UUID        REFERENCES clinicians(id),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  investigations           IS 'Investigation orders and results. Status: ordered → sent → resulted | critical | cancelled.';
COMMENT ON COLUMN investigations.is_critical IS 'CLINICAL: Critical results must trigger immediate notification to the ordering clinician. Never store silently.';

CREATE INDEX idx_inv_patient    ON investigations (patient_id);
CREATE INDEX idx_inv_encounter  ON investigations (encounter_id);
CREATE INDEX idx_inv_note       ON investigations (note_id);
CREATE INDEX idx_inv_status     ON investigations (patient_id, status);
CREATE INDEX idx_inv_critical   ON investigations (is_critical, status) WHERE is_critical = true;


-- =============================================================================
-- SECTION 10: ORDERS
-- Clinical orders from voice, SOAP plan, or quick-entry.
-- Covers nursing instructions, referrals, follow-up tasks — anything not
-- captured in the medications or investigations tables.
-- SAFETY: status = 'confirmed' requires explicit doctor action. Never automatic.
-- =============================================================================

CREATE TABLE orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id),
    encounter_id    UUID        REFERENCES encounters(id),
    note_id         UUID        REFERENCES clinical_notes(id),

    order_text      TEXT        NOT NULL,
    order_type      TEXT        NOT NULL
                    CHECK (order_type IN ('medication', 'investigation',
                                          'nursing', 'referral', 'follow_up', 'other')),

    -- SAFETY: 'confirmed' must only be set after explicit doctor confirmation.
    status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

    -- Set when an order is converted to a formal downstream record
    medication_id       UUID    REFERENCES medications(id),
    investigation_id    UUID    REFERENCES investigations(id),

    created_by      UUID        REFERENCES clinicians(id),
    confirmed_by    UUID        REFERENCES clinicians(id),
    confirmed_at    TIMESTAMPTZ,
    completed_by    UUID        REFERENCES clinicians(id),
    completed_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE orders IS 'SAFETY: Clinical orders from voice, SOAP plan, or quick-entry. confirmed status requires explicit doctor action — never auto-confirmed.';

CREATE INDEX idx_orders_patient    ON orders (patient_id);
CREATE INDEX idx_orders_encounter  ON orders (encounter_id);
CREATE INDEX idx_orders_note       ON orders (note_id);
CREATE INDEX idx_orders_status     ON orders (patient_id, status);
CREATE INDEX idx_orders_pending    ON orders (status, created_at) WHERE status = 'pending';


-- =============================================================================
-- SECTION 11: SCRIBING SESSIONS
-- Ambient scribing session records — audio capture through to signed note.
-- CLINICAL: The transcript is an internal processing artefact.
--           It must never be shown to the doctor on the review screen.
--           The doctor sees only the structured SOAP note.
-- =============================================================================

CREATE TABLE scribing_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID        NOT NULL REFERENCES patients(id),
    encounter_id    UUID        REFERENCES encounters(id),
    clinician_id    UUID        REFERENCES clinicians(id),

    capture_state   TEXT        NOT NULL DEFAULT 'idle'
                    CHECK (capture_state IN ('idle', 'recording',
                                             'paused', 'stopped', 'error')),

    -- CLINICAL: The transcript is an internal artefact — never display to the doctor.
    full_transcript TEXT,

    -- Set once SOAP note is generated and signed
    note_id         UUID        REFERENCES clinical_notes(id),

    -- ASR and AI provider tracking — feeds vendor comparison dashboard
    asr_provider    TEXT,   -- 'web-speech' | 'medasr' | 'whisper' | 'sarvam' | 'azure'
    ai_provider     TEXT,   -- 'claude' | 'openai' | 'gemini' | 'local-llama'
    asr_latency_ms  INTEGER CHECK (asr_latency_ms >= 0),
    ai_latency_ms   INTEGER CHECK (ai_latency_ms >= 0),

    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    duration_secs   INTEGER     CHECK (duration_secs >= 0),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  scribing_sessions             IS 'CLINICAL: Ambient scribing sessions. full_transcript is internal only — never display to the doctor. Doctor sees only the SOAP note.';
COMMENT ON COLUMN scribing_sessions.asr_provider IS 'Tracks which ASR vendor handled this session. Feeds vendor comparison dashboard for objective performance data.';

CREATE INDEX idx_scribing_patient    ON scribing_sessions (patient_id);
CREATE INDEX idx_scribing_encounter  ON scribing_sessions (encounter_id);
CREATE INDEX idx_scribing_clinician  ON scribing_sessions (clinician_id);


-- =============================================================================
-- SECTION 12: AUDIT LOG
-- Immutable, append-only event log. Every clinical action fires an event here.
-- SAFETY: No UPDATE or DELETE is ever issued against this table.
--         Enforced at DB level by REVOKE (see GRANTS section).
-- DPDP Act 2023: ip_address and user_agent captured for access logging.
-- =============================================================================

CREATE TABLE audit_log (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event classification
    -- Examples: note.signed, medication.confirmed, amendment.created,
    --           order.confirmed, patient.discharged, vitals.recorded,
    --           wrong_patient.quarantined
    event_type      TEXT        NOT NULL,
    entity_type     TEXT        NOT NULL,
    -- entity_type values: patient | clinical_note | medication | order |
    --                     vitals | amendment | investigation | scribing_session

    entity_id       UUID,
    patient_id      UUID        REFERENCES patients(id),
    clinician_id    UUID        REFERENCES clinicians(id),
    session_id      UUID,       -- scribing_sessions.id if applicable

    -- Event-specific structured data — schema varies by event_type
    payload         JSONB,

    -- DPDP Act 2023: access context for regulatory compliance
    ip_address      INET,
    user_agent      TEXT,

    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    -- No updated_at. No deleted_at. This table is append-only, permanently.
);

COMMENT ON TABLE  audit_log             IS 'CLINICAL: Immutable append-only audit trail. Every clinical action logged here. No UPDATE or DELETE ever. Enforced by REVOKE in GRANTS section.';
COMMENT ON COLUMN audit_log.event_type  IS 'Examples: note.signed, medication.confirmed, amendment.created, order.confirmed, patient.discharged, vitals.recorded, wrong_patient.quarantined.';
COMMENT ON COLUMN audit_log.payload     IS 'Event-specific structured data. Schema depends on event_type. Always JSONB for queryability.';
COMMENT ON COLUMN audit_log.ip_address  IS 'DPDP Act 2023: captured for access logging and regulatory compliance. Stored as INET for efficient range queries.';

CREATE INDEX idx_audit_patient    ON audit_log (patient_id, occurred_at DESC);
CREATE INDEX idx_audit_clinician  ON audit_log (clinician_id, occurred_at DESC);
CREATE INDEX idx_audit_event      ON audit_log (event_type, occurred_at DESC);
CREATE INDEX idx_audit_entity     ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_time       ON audit_log (occurred_at DESC);


-- =============================================================================
-- SECTION 13: TRIGGERS
-- updated_at maintenance on mutable tables.
-- Audit log and amendments have no updated_at — they are append-only.
-- Clinical notes have no updated_at — they are immutable once created.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clinicians_updated_at
    BEFORE UPDATE ON clinicians
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_encounters_updated_at
    BEFORE UPDATE ON encounters
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_investigations_updated_at
    BEFORE UPDATE ON investigations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- SECTION 14: VIEWS
-- Read-only projections for common clinical queries.
-- =============================================================================

-- Ward list — primary query driving the ward list screen.
-- Sorted by NEWS2 descending (highest risk first).
CREATE VIEW v_ward_list AS
SELECT
    p.id,
    p.hospital_number,
    p.abha_id,
    p.name,
    p.age,
    p.sex,
    p.ward,
    p.bed,
    c.name                              AS consultant_name,
    p.primary_diagnosis,
    p.admission_date,
    CURRENT_DATE - p.admission_date     AS day_of_stay,
    p.news2_score,
    p.status,
    p.summary,
    -- Staleness indicator: when were vitals last recorded?
    (SELECT recorded_at FROM vitals v
     WHERE v.patient_id = p.id
     ORDER BY v.recorded_at DESC LIMIT 1)  AS last_vitals_at,
    -- Critical investigation flag — drives red badge on patient card
    EXISTS (
        SELECT 1 FROM investigations i
        WHERE i.patient_id = p.id
          AND i.is_critical = true
          AND i.status = 'critical'
    )                                   AS has_critical_result,
    -- Unconfirmed medication count — drives amber badge
    (SELECT COUNT(*) FROM medications m
     WHERE m.patient_id = p.id
       AND m.is_confirmed = false
       AND m.is_active = true)          AS unconfirmed_med_count,
    -- Pending orders count
    (SELECT COUNT(*) FROM orders o
     WHERE o.patient_id = p.id
       AND o.status = 'pending')        AS pending_order_count
FROM patients p
LEFT JOIN clinicians c ON c.id = p.consultant_id
WHERE p.status = 'active'
ORDER BY p.news2_score DESC NULLS LAST, p.name;

COMMENT ON VIEW v_ward_list IS 'Primary ward list. Sorted by NEWS2 descending. Includes critical result flag, unconfirmed medication count, and pending order count.';


-- Latest complete vitals per patient
CREATE VIEW v_latest_vitals AS
SELECT DISTINCT ON (patient_id)
    id,
    patient_id,
    encounter_id,
    recorded_at,
    temperature,
    heart_rate,
    systolic_bp,
    diastolic_bp,
    spo2,
    respiratory_rate,
    consciousness,
    on_supplemental_o2,
    spo2_scale,
    news2_score,
    news2_is_complete,
    news2_missing_params,
    news2_breakdown
FROM vitals
ORDER BY patient_id, recorded_at DESC;

COMMENT ON VIEW v_latest_vitals IS 'Most recent vitals row per patient. Always check news2_is_complete before displaying the NEWS2 score.';


-- Latest active signed note per patient
CREATE VIEW v_latest_note AS
SELECT DISTINCT ON (patient_id)
    id,
    patient_id,
    encounter_id,
    note_type,
    generation_method,
    primary_diagnosis,
    active_problems_summary,
    display_subjective,
    display_objective,
    display_assessment,
    display_plan,
    signed_by,
    signed_at,
    is_short_consultation,
    manual_corrections_count
FROM clinical_notes
WHERE is_signed = true
  AND is_active = true
ORDER BY patient_id, signed_at DESC;

COMMENT ON VIEW v_latest_note IS 'Most recent active signed note per patient. is_active=false notes (superseded by amendments) are excluded.';


-- Pending orders needing confirmation — feeds nurse board and order review screen
CREATE VIEW v_pending_orders AS
SELECT
    o.id,
    o.patient_id,
    p.name        AS patient_name,
    p.bed,
    p.ward,
    o.order_text,
    o.order_type,
    o.status,
    o.created_at,
    c.name        AS created_by_name
FROM orders o
JOIN patients p ON p.id = o.patient_id
LEFT JOIN clinicians c ON c.id = o.created_by
WHERE o.status = 'pending'
ORDER BY o.created_at ASC;

COMMENT ON VIEW v_pending_orders IS 'All orders awaiting confirmation. Primary feed for nurse task board and order confirmation screen.';


-- =============================================================================
-- SECTION 15: GRANTS
-- Role-based access control.
-- klinik_user: application service account
-- klinik_readonly: reporting and audit read-only access
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'klinik_user') THEN
        CREATE ROLE klinik_user LOGIN PASSWORD 'change_in_production';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'klinik_readonly') THEN
        CREATE ROLE klinik_readonly LOGIN PASSWORD 'change_in_production';
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO klinik_user, klinik_readonly;

-- klinik_user: full read/write on mutable tables
GRANT SELECT, INSERT, UPDATE ON
    clinicians, patients, encounters, vitals, problems,
    medications, investigations, orders, scribing_sessions
TO klinik_user;

-- klinik_user: INSERT only on immutable tables — no UPDATE, no DELETE, ever
GRANT SELECT, INSERT ON clinical_notes TO klinik_user;
GRANT SELECT, INSERT ON amendments     TO klinik_user;
GRANT SELECT, INSERT ON audit_log      TO klinik_user;

-- SAFETY: Explicitly revoke destructive operations on immutable tables.
-- Belt-and-suspenders: application policy also enforces this,
-- but DB-level REVOKE is the authoritative control.
REVOKE UPDATE, DELETE ON clinical_notes FROM klinik_user;
REVOKE UPDATE, DELETE ON amendments     FROM klinik_user;
REVOKE UPDATE, DELETE ON audit_log      FROM klinik_user;

-- Views
GRANT SELECT ON
    v_ward_list, v_latest_vitals, v_latest_note, v_pending_orders
TO klinik_user;

-- klinik_readonly: SELECT only on everything
GRANT SELECT ON ALL TABLES IN SCHEMA public TO klinik_readonly;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO klinik_user;


-- =============================================================================
-- SECTION 16: SEED DATA
-- Demo clinician for development. Matches mock patient data in mockPatients.ts.
-- All data is clearly synthetic — no real patient or clinician information.
-- =============================================================================

INSERT INTO clinicians (id, name, designation, role, department, employee_id, registration_no)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Dr. Meera Iyer',
    'Consultant Surgical Oncologist',
    'doctor',
    'Surgical Oncology — Ward 3',
    'KLK-DOC-001',
    'MH-NMR-2019-004521'
);


-- =============================================================================
-- END OF SCHEMA
--
-- Tables (12):  clinicians, patients, encounters, vitals, problems,
--               clinical_notes, amendments, medications, investigations,
--               orders, scribing_sessions, audit_log
--
-- Views (4):    v_ward_list, v_latest_vitals, v_latest_note, v_pending_orders
--
-- Triggers:     set_updated_at on all mutable tables
--               (not on clinical_notes, amendments, audit_log — append-only)
--
-- Roles:        klinik_user    — read/write + INSERT-only on immutable tables
--               klinik_readonly — SELECT only
--
-- To apply:     psql -U postgres -d klinik_dev -f src/database/schema.sql
-- To connect:   psql -U klinik_user -d klinik_dev
-- =============================================================================
