# Local QA database field coverage

Historical QA coverage snapshot. The generator has been removed. Counts only; no secret or patient values.

NULL is intentional for states not reached (e.g. active admission discharge time, pending task completion, unsigned forms). Empty arrays can mean no allergy/device. This inventory does not claim every lifecycle state is populated.

## UI → database domain map

- **admissions**: clinical.admissions, initial_assessments, admission_checklist_items; organization beds/units
- **patients**: clinical.patients, admissions, diagnoses, notes, patient_identifiers, patient_contacts, next_of_kin, patient_coverage
- **observations**: clinical.vitals, alerts, observation_schedules (NEWS2 computed by app rules)
- **notes**: clinical.notes, note_versions, diagnoses (author_stamp and clinical_context JSON)
- **orders**: clinical.orders, tasks, medication_catalog, medication_schedules, medication_doses, medication_allergy_reviews
- **patient-workflows**: clinical nursing_assessments, nursing_care_plan_items, nursing_recurring_tasks, nursing_task_completions, patient_weights, fluid_entries, nursing_sbar_calls, cross_referrals, consultant_rounds, patient_movements, discharge_plans, discharge_tasks; finance claims/queries/events/deposits
- **handover**: clinical.handover_sessions/items/acknowledgments, ipass_sessions/items/questions, nurse_handover_sessions/items/questions, contingencies, shift_events
- **opd**: opd.visits (triage JSON: systolic, diastolic, pulse, spo2, temperature, weight_kg), visit_diagnoses, visit_investigations, prescriptions, visit_charges, dispatches
- **forms**: forms.templates, template_versions, instances, instance_versions, signatures
- **chat**: clinical.patient_chat_messages, patient_chat_revisions/mentions/attachments; attachment bytes require object storage
- **investigations**: clinical.orders supplies ordered tests. Report/status updates are a frontend adapter input, NOT currently persisted in PostgreSQL. Seeding payload.report does not render a report.
- **wards**: organization facilities/departments/units/wards/rooms/beds; clinical.admissions; staff memberships/shifts
- **worklist**: Derived from clinical observations/tasks/orders/alerts/nursing tasks/doses/assessments and active staff shifts
- **home**: Derived from clinical.patients/admissions/vitals/diagnoses/alerts
- **auth**: staff.users, user_credentials, sessions (tokens are created by real login only)
- **layout**: Browser preferences; no database seed required
- **documents**: Derived printable documents; no independent database table
- **tasks**: clinical.tasks joined to clinical.orders

## Known non-seedable or deliberate exclusions

- Investigation result bodies/stages have no database/API adapter yet; frontend takes an optional `updates` input. Orders alone cannot populate report panels.
- No forged signatures, fake live session tokens, emergency break-glass grants, or made-up object-storage keys. Exercise those via the app.
- No synthetic metadata is removed from catalogues or internal tracking; names and visible clinical values have no test-name prefixes.
- All values are fictional. This is UI/workflow QA data, not clinically validated reference cases or production patient records.

## Every database column

| Table.column | Type | Nullable | Rows | Non-null | Non-empty* |
|---|---|---|---:|---:|---:|
| clinical.admission_checklist_items.id | uuid | NO | 320 | 320 | 320 |
| clinical.admission_checklist_items.admission_id | uuid | NO | 320 | 320 | 320 |
| clinical.admission_checklist_items.code | text | NO | 320 | 320 | 320 |
| clinical.admission_checklist_items.status | text | NO | 320 | 320 | 320 |
| clinical.admission_checklist_items.completed_by | uuid | YES | 320 | 280 | 280 |
| clinical.admission_checklist_items.completed_at | timestamp with time zone | YES | 320 | 280 | 280 |
| clinical.admission_checklist_items.evidence | text | YES | 320 | 280 | 280 |
| clinical.admission_requests.id | uuid | NO | 3 | 3 | 3 |
| clinical.admission_requests.patient_id | uuid | NO | 3 | 3 | 3 |
| clinical.admission_requests.source | text | NO | 3 | 3 | 3 |
| clinical.admission_requests.diagnosis | text | NO | 3 | 3 | 3 |
| clinical.admission_requests.clinical_handover | text | NO | 3 | 3 | 3 |
| clinical.admission_requests.requested_unit_id | uuid | NO | 3 | 3 | 3 |
| clinical.admission_requests.status | text | NO | 3 | 3 | 3 |
| clinical.admission_requests.requested_by | uuid | NO | 3 | 3 | 3 |
| clinical.admission_requests.requested_at | timestamp with time zone | NO | 3 | 3 | 3 |
| clinical.admission_requests.resolved_by | uuid | YES | 3 | 0 | 0 |
| clinical.admission_requests.resolved_at | timestamp with time zone | YES | 3 | 0 | 0 |
| clinical.admission_requests.decline_reason | text | YES | 3 | 0 | 0 |
| clinical.admission_requests.admission_id | uuid | YES | 3 | 0 | 0 |
| clinical.admission_requests.opd_visit_id | uuid | YES | 3 | 3 | 3 |
| clinical.admissions.id | uuid | NO | 40 | 40 | 40 |
| clinical.admissions.patient_id | uuid | NO | 40 | 40 | 40 |
| clinical.admissions.status | text | NO | 40 | 40 | 40 |
| clinical.admissions.ward | text | YES | 40 | 40 | 40 |
| clinical.admissions.bed | text | YES | 40 | 40 | 40 |
| clinical.admissions.admitted_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.admissions.discharged_at | timestamp with time zone | YES | 40 | 0 | 0 |
| clinical.admissions.revision | bigint | NO | 40 | 40 | 40 |
| clinical.admissions.created_by | uuid | YES | 40 | 40 | 40 |
| clinical.admissions.assigned_to | uuid | YES | 40 | 40 | 40 |
| clinical.admissions.severity | text | NO | 40 | 40 | 40 |
| clinical.admissions.exit_type | text | YES | 40 | 0 | 0 |
| clinical.admissions.exit_dest | text | YES | 40 | 0 | 0 |
| clinical.admissions.exit_note | text | YES | 40 | 0 | 0 |
| clinical.admissions.assigned_doctor_id | uuid | YES | 40 | 40 | 40 |
| clinical.admissions.bed_id | uuid | YES | 40 | 40 | 40 |
| clinical.admissions.unit_id | uuid | YES | 40 | 40 | 40 |
| clinical.admissions.arrival_status | text | NO | 40 | 40 | 40 |
| clinical.admissions.arrived_at | timestamp with time zone | YES | 40 | 40 | 40 |
| clinical.alerts.id | uuid | NO | 14 | 14 | 14 |
| clinical.alerts.admission_id | uuid | NO | 14 | 14 | 14 |
| clinical.alerts.source_vitals_id | uuid | YES | 14 | 14 | 14 |
| clinical.alerts.type | text | NO | 14 | 14 | 14 |
| clinical.alerts.severity | text | NO | 14 | 14 | 14 |
| clinical.alerts.message | text | NO | 14 | 14 | 14 |
| clinical.alerts.status | text | NO | 14 | 14 | 14 |
| clinical.alerts.created_at | timestamp with time zone | NO | 14 | 14 | 14 |
| clinical.alerts.acknowledged_by | uuid | YES | 14 | 0 | 0 |
| clinical.alerts.acknowledged_at | timestamp with time zone | YES | 14 | 0 | 0 |
| clinical.alerts.resolved_by | uuid | YES | 14 | 0 | 0 |
| clinical.alerts.resolved_at | timestamp with time zone | YES | 14 | 0 | 0 |
| clinical.alerts.resolution_reason | text | YES | 14 | 0 | 0 |
| clinical.alerts.superseded_by | uuid | YES | 14 | 0 | 0 |
| clinical.amendments.id | uuid | NO | 0 | 0 | 0 |
| clinical.amendments.note_version_id | uuid | NO | 0 | 0 | 0 |
| clinical.amendments.body | text | NO | 0 | 0 | 0 |
| clinical.amendments.reason | text | YES | 0 | 0 | 0 |
| clinical.amendments.created_by | uuid | NO | 0 | 0 | 0 |
| clinical.amendments.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.audit_log.id | bigint | NO | 0 | 0 | 0 |
| clinical.audit_log.actor_user_id | uuid | YES | 0 | 0 | 0 |
| clinical.audit_log.action | text | NO | 0 | 0 | 0 |
| clinical.audit_log.record_table | text | NO | 0 | 0 | 0 |
| clinical.audit_log.record_id | uuid | NO | 0 | 0 | 0 |
| clinical.audit_log.before | jsonb | YES | 0 | 0 | 0 |
| clinical.audit_log.after | jsonb | YES | 0 | 0 | 0 |
| clinical.audit_log.at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.bed_assignments.id | uuid | NO | 40 | 40 | 40 |
| clinical.bed_assignments.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.bed_assignments.bed_id | uuid | NO | 40 | 40 | 40 |
| clinical.bed_assignments.starts_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.bed_assignments.ends_at | timestamp with time zone | YES | 40 | 5 | 5 |
| clinical.bed_assignments.assigned_by | uuid | YES | 40 | 40 | 40 |
| clinical.bed_assignments.end_reason | text | YES | 40 | 0 | 0 |
| clinical.break_glass_access.id | uuid | NO | 0 | 0 | 0 |
| clinical.break_glass_access.user_id | uuid | NO | 0 | 0 | 0 |
| clinical.break_glass_access.admission_id | uuid | NO | 0 | 0 | 0 |
| clinical.break_glass_access.reason | text | NO | 0 | 0 | 0 |
| clinical.break_glass_access.granted_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.break_glass_access.expires_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.break_glass_access.revoked_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.consultant_care_transfers.id | uuid | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.admission_id | uuid | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.requested_by | uuid | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.from_consultant_id | uuid | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.to_consultant_id | uuid | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.reason | text | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.discussed_with_current | boolean | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.patient_family_informed | boolean | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.status | text | NO | 0 | 0 | 0 |
| clinical.consultant_care_transfers.released_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.consultant_care_transfers.resolved_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.consultant_care_transfers.resolution_reason | text | YES | 0 | 0 | 0 |
| clinical.consultant_care_transfers.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.consultant_rounds.id | uuid | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.admission_id | uuid | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.consultant_id | uuid | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.subjective | text | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.objective | text | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.assessment | text | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.plan | text | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.note_id | uuid | NO | 43 | 43 | 43 |
| clinical.consultant_rounds.signed_at | timestamp with time zone | NO | 43 | 43 | 43 |
| clinical.contingencies.id | uuid | NO | 40 | 40 | 40 |
| clinical.contingencies.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.contingencies.body | text | NO | 40 | 40 | 40 |
| clinical.contingencies.created_by | uuid | NO | 40 | 40 | 40 |
| clinical.contingencies.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.cross_referrals.id | uuid | NO | 15 | 15 | 15 |
| clinical.cross_referrals.admission_id | uuid | NO | 15 | 15 | 15 |
| clinical.cross_referrals.requested_by | uuid | NO | 15 | 15 | 15 |
| clinical.cross_referrals.consultant_id | uuid | NO | 15 | 15 | 15 |
| clinical.cross_referrals.specialty | text | NO | 15 | 15 | 15 |
| clinical.cross_referrals.urgency | text | NO | 15 | 15 | 15 |
| clinical.cross_referrals.question | text | NO | 15 | 15 | 15 |
| clinical.cross_referrals.findings | text | NO | 15 | 15 | 15 |
| clinical.cross_referrals.status | text | NO | 15 | 15 | 15 |
| clinical.cross_referrals.impression | text | YES | 15 | 0 | 0 |
| clinical.cross_referrals.recommendations | text | YES | 15 | 0 | 0 |
| clinical.cross_referrals.call_again | text | YES | 15 | 0 | 0 |
| clinical.cross_referrals.created_at | timestamp with time zone | NO | 15 | 15 | 15 |
| clinical.cross_referrals.seen_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.cross_referrals.opinion_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.cross_referrals.opinion_note_id | uuid | YES | 15 | 0 | 0 |
| clinical.cross_referrals.acknowledged_by | uuid | YES | 15 | 0 | 0 |
| clinical.cross_referrals.acknowledged_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.cross_referrals.closed_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.diagnoses.id | uuid | NO | 40 | 40 | 40 |
| clinical.diagnoses.patient_id | uuid | NO | 40 | 40 | 40 |
| clinical.diagnoses.admission_id | uuid | YES | 40 | 40 | 40 |
| clinical.diagnoses.description | text | NO | 40 | 40 | 40 |
| clinical.diagnoses.status | text | NO | 40 | 40 | 40 |
| clinical.diagnoses.diagnosed_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.diagnoses.resolved_at | timestamp with time zone | YES | 40 | 0 | 0 |
| clinical.diagnoses.created_by | uuid | NO | 40 | 40 | 40 |
| clinical.diagnoses.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.discharge_plans.id | uuid | NO | 15 | 15 | 15 |
| clinical.discharge_plans.admission_id | uuid | NO | 15 | 15 | 15 |
| clinical.discharge_plans.discharge_type | text | NO | 15 | 15 | 15 |
| clinical.discharge_plans.status | text | NO | 15 | 15 | 15 |
| clinical.discharge_plans.planned_at | timestamp with time zone | NO | 15 | 15 | 15 |
| clinical.discharge_plans.condition | text | NO | 15 | 15 | 15 |
| clinical.discharge_plans.follow_up | text | NO | 15 | 15 | 15 |
| clinical.discharge_plans.form_version_id | uuid | YES | 15 | 0 | 0 |
| clinical.discharge_plans.summary | text | YES | 15 | 12 | 12 |
| clinical.discharge_plans.summary_signed_by | uuid | YES | 15 | 0 | 0 |
| clinical.discharge_plans.summary_signed_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.discharge_plans.requested_by | uuid | NO | 15 | 15 | 15 |
| clinical.discharge_plans.requested_at | timestamp with time zone | NO | 15 | 15 | 15 |
| clinical.discharge_plans.approved_by | uuid | YES | 15 | 0 | 0 |
| clinical.discharge_plans.approved_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.discharge_plans.completed_by | uuid | YES | 15 | 0 | 0 |
| clinical.discharge_plans.completed_at | timestamp with time zone | YES | 15 | 0 | 0 |
| clinical.discharge_plans.revision | integer | NO | 15 | 15 | 15 |
| clinical.discharge_plans.final_diagnosis | text | YES | 15 | 12 | 12 |
| clinical.discharge_tasks.id | uuid | NO | 91 | 91 | 91 |
| clinical.discharge_tasks.plan_id | uuid | NO | 91 | 91 | 91 |
| clinical.discharge_tasks.code | text | NO | 91 | 91 | 91 |
| clinical.discharge_tasks.status | text | NO | 91 | 91 | 91 |
| clinical.discharge_tasks.evidence | text | YES | 91 | 0 | 0 |
| clinical.discharge_tasks.completed_by | uuid | YES | 91 | 0 | 0 |
| clinical.discharge_tasks.completed_at | timestamp with time zone | YES | 91 | 0 | 0 |
| clinical.fluid_entries.id | uuid | NO | 244 | 244 | 244 |
| clinical.fluid_entries.admission_id | uuid | NO | 244 | 244 | 244 |
| clinical.fluid_entries.recorded_by | uuid | NO | 244 | 244 | 244 |
| clinical.fluid_entries.direction | text | NO | 244 | 244 | 244 |
| clinical.fluid_entries.category | text | NO | 244 | 244 | 244 |
| clinical.fluid_entries.volume_ml | double precision | NO | 244 | 244 | 244 |
| clinical.fluid_entries.occurred_at | timestamp with time zone | NO | 244 | 244 | 244 |
| clinical.fluid_entries.recorded_at | timestamp with time zone | NO | 244 | 244 | 244 |
| clinical.handoffs.id | uuid | NO | 0 | 0 | 0 |
| clinical.handoffs.admission_id | uuid | NO | 0 | 0 | 0 |
| clinical.handoffs.requested_by | uuid | NO | 0 | 0 | 0 |
| clinical.handoffs.assigned_to | uuid | NO | 0 | 0 | 0 |
| clinical.handoffs.reason | text | YES | 0 | 0 | 0 |
| clinical.handoffs.status | text | NO | 0 | 0 | 0 |
| clinical.handoffs.requested_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.handoffs.acknowledged_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.handoffs.acknowledged_by | uuid | YES | 0 | 0 | 0 |
| clinical.handoffs.done_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.handoffs.readback | text | YES | 0 | 0 | 0 |
| clinical.handover_acknowledgments.id | uuid | NO | 0 | 0 | 0 |
| clinical.handover_acknowledgments.item_id | uuid | NO | 0 | 0 | 0 |
| clinical.handover_acknowledgments.item_version | integer | NO | 0 | 0 | 0 |
| clinical.handover_acknowledgments.acknowledged_by | uuid | NO | 0 | 0 | 0 |
| clinical.handover_acknowledgments.notes | text | YES | 0 | 0 | 0 |
| clinical.handover_acknowledgments.acknowledged_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.handover_items.id | uuid | NO | 40 | 40 | 40 |
| clinical.handover_items.session_id | uuid | NO | 40 | 40 | 40 |
| clinical.handover_items.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.handover_items.snapshot | jsonb | NO | 40 | 40 | 40 |
| clinical.handover_items.item_version | integer | NO | 40 | 40 | 40 |
| clinical.handover_items.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.handover_sessions.id | uuid | NO | 8 | 8 | 8 |
| clinical.handover_sessions.outgoing_doctor_id | uuid | NO | 8 | 8 | 8 |
| clinical.handover_sessions.incoming_doctor_id | uuid | NO | 8 | 8 | 8 |
| clinical.handover_sessions.ward | text | YES | 8 | 0 | 0 |
| clinical.handover_sessions.status | text | NO | 8 | 8 | 8 |
| clinical.handover_sessions.created_at | timestamp with time zone | NO | 8 | 8 | 8 |
| clinical.handover_sessions.completed_at | timestamp with time zone | YES | 8 | 0 | 0 |
| clinical.infusion_events.id | uuid | NO | 3 | 3 | 3 |
| clinical.infusion_events.schedule_id | uuid | NO | 3 | 3 | 3 |
| clinical.infusion_events.action | text | NO | 3 | 3 | 3 |
| clinical.infusion_events.rate | text | YES | 3 | 3 | 3 |
| clinical.infusion_events.reason | text | NO | 3 | 3 | 3 |
| clinical.infusion_events.recorded_by | uuid | NO | 3 | 3 | 3 |
| clinical.infusion_events.recorded_at | timestamp with time zone | NO | 3 | 3 | 3 |
| clinical.initial_assessments.id | uuid | NO | 40 | 40 | 40 |
| clinical.initial_assessments.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.initial_assessments.chief_complaint | text | NO | 40 | 40 | 40 |
| clinical.initial_assessments.history | text | NO | 40 | 40 | 40 |
| clinical.initial_assessments.examination | text | NO | 40 | 40 | 40 |
| clinical.initial_assessments.clinical_impression | text | NO | 40 | 40 | 40 |
| clinical.initial_assessments.plan | text | NO | 40 | 40 | 40 |
| clinical.initial_assessments.assessed_by | uuid | NO | 40 | 40 | 40 |
| clinical.initial_assessments.signed_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.ipass_items.id | uuid | NO | 3 | 3 | 3 |
| clinical.ipass_items.session_id | uuid | NO | 3 | 3 | 3 |
| clinical.ipass_items.admission_id | uuid | NO | 3 | 3 | 3 |
| clinical.ipass_items.patient_name | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.ward | text | YES | 3 | 3 | 3 |
| clinical.ipass_items.bed | text | YES | 3 | 3 | 3 |
| clinical.ipass_items.severity | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.patient_summary | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.action_list | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.contingency | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.status | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.snapshot_revision | bigint | NO | 3 | 3 | 3 |
| clinical.ipass_items.signed_at | timestamp with time zone | YES | 3 | 0 | 0 |
| clinical.ipass_items.readback | text | YES | 3 | 0 | 0 |
| clinical.ipass_items.accepted_at | timestamp with time zone | YES | 3 | 0 | 0 |
| clinical.ipass_items.reviewed_by | uuid | YES | 3 | 0 | 0 |
| clinical.ipass_items.receiver_view | text | YES | 3 | 0 | 0 |
| clinical.ipass_items.stale_acknowledged | boolean | NO | 3 | 3 | 3 |
| clinical.ipass_items.arrival_status | text | NO | 3 | 3 | 3 |
| clinical.ipass_items.action_tasks | jsonb | YES | 3 | 0 | 0 |
| clinical.ipass_items.item_revision | bigint | NO | 3 | 3 | 3 |
| clinical.ipass_questions.id | uuid | NO | 0 | 0 | 0 |
| clinical.ipass_questions.item_id | uuid | NO | 0 | 0 | 0 |
| clinical.ipass_questions.author_id | uuid | NO | 0 | 0 | 0 |
| clinical.ipass_questions.body | text | NO | 0 | 0 | 0 |
| clinical.ipass_questions.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.ipass_sessions.id | uuid | NO | 3 | 3 | 3 |
| clinical.ipass_sessions.outgoing_doctor_id | uuid | NO | 3 | 3 | 3 |
| clinical.ipass_sessions.incoming_doctor_id | uuid | YES | 3 | 3 | 3 |
| clinical.ipass_sessions.status | text | NO | 3 | 3 | 3 |
| clinical.ipass_sessions.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| clinical.ipass_sessions.sent_at | timestamp with time zone | YES | 3 | 0 | 0 |
| clinical.ipass_sessions.completed_at | timestamp with time zone | YES | 3 | 0 | 0 |
| clinical.ipass_sessions.ward | text | YES | 3 | 0 | 0 |
| clinical.medication_allergy_reviews.id | uuid | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.schedule_id | uuid | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.patient_revision | bigint | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.decision | text | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.reason | text | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.reviewed_by | uuid | NO | 44 | 44 | 44 |
| clinical.medication_allergy_reviews.reviewed_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.medication_catalog.id | uuid | NO | 69 | 69 | 69 |
| clinical.medication_catalog.code | text | NO | 69 | 69 | 69 |
| clinical.medication_catalog.brand | text | NO | 69 | 69 | 69 |
| clinical.medication_catalog.ingredient | text | NO | 69 | 69 | 69 |
| clinical.medication_catalog.drug_class | text | NO | 69 | 69 | 69 |
| clinical.medication_catalog.in_stock | boolean | NO | 69 | 69 | 69 |
| clinical.medication_catalog.synthetic | boolean | NO | 69 | 69 | 69 |
| clinical.medication_catalog.visible | boolean | NO | 69 | 69 | 69 |
| clinical.medication_catalog_allergens.medication_id | uuid | NO | 7 | 7 | 7 |
| clinical.medication_catalog_allergens.allergen | text | NO | 7 | 7 | 7 |
| clinical.medication_doses.id | uuid | NO | 30 | 30 | 30 |
| clinical.medication_doses.schedule_id | uuid | NO | 30 | 30 | 30 |
| clinical.medication_doses.due_at | timestamp with time zone | NO | 30 | 30 | 30 |
| clinical.medication_doses.status | text | NO | 30 | 30 | 30 |
| clinical.medication_doses.acted_by | uuid | YES | 30 | 27 | 27 |
| clinical.medication_doses.acted_at | timestamp with time zone | YES | 30 | 27 | 27 |
| clinical.medication_doses.hold_reason | text | YES | 30 | 0 | 0 |
| clinical.medication_doses.administration_reason | text | YES | 30 | 27 | 27 |
| clinical.medication_schedules.id | uuid | NO | 44 | 44 | 44 |
| clinical.medication_schedules.admission_id | uuid | NO | 44 | 44 | 44 |
| clinical.medication_schedules.order_id | uuid | NO | 44 | 44 | 44 |
| clinical.medication_schedules.drug | text | NO | 44 | 44 | 44 |
| clinical.medication_schedules.dose | text | NO | 44 | 44 | 44 |
| clinical.medication_schedules.route | text | NO | 44 | 44 | 44 |
| clinical.medication_schedules.prn_indication | text | YES | 44 | 40 | 40 |
| clinical.medication_schedules.active | boolean | NO | 44 | 44 | 44 |
| clinical.medication_schedules.created_by | uuid | NO | 44 | 44 | 44 |
| clinical.medication_schedules.created_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.medication_schedules.prn_min_interval_minutes | integer | YES | 44 | 40 | 40 |
| clinical.medication_schedules.prn_max_doses_24h | integer | YES | 44 | 40 | 40 |
| clinical.medication_schedules.catalog_id | uuid | YES | 44 | 44 | 44 |
| clinical.next_of_kin.id | uuid | NO | 54 | 54 | 54 |
| clinical.next_of_kin.patient_id | uuid | NO | 54 | 54 | 54 |
| clinical.next_of_kin.name | text | NO | 54 | 54 | 54 |
| clinical.next_of_kin.relationship | text | NO | 54 | 54 | 54 |
| clinical.next_of_kin.phone | text | NO | 54 | 54 | 54 |
| clinical.next_of_kin.address | text | YES | 54 | 54 | 54 |
| clinical.next_of_kin.is_primary | boolean | NO | 54 | 54 | 54 |
| clinical.next_of_kin.created_at | timestamp with time zone | NO | 54 | 54 | 54 |
| clinical.note_versions.id | uuid | NO | 44 | 44 | 44 |
| clinical.note_versions.note_id | uuid | NO | 44 | 44 | 44 |
| clinical.note_versions.version_no | integer | NO | 44 | 44 | 44 |
| clinical.note_versions.body | text | NO | 44 | 44 | 44 |
| clinical.note_versions.confirmed_by | uuid | NO | 44 | 44 | 44 |
| clinical.note_versions.confirmed_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.notes.id | uuid | NO | 44 | 44 | 44 |
| clinical.notes.admission_id | uuid | NO | 44 | 44 | 44 |
| clinical.notes.kind | text | NO | 44 | 44 | 44 |
| clinical.notes.draft_body | text | YES | 44 | 44 | 44 |
| clinical.notes.revision | bigint | NO | 44 | 44 | 44 |
| clinical.notes.created_by | uuid | NO | 44 | 44 | 44 |
| clinical.notes.created_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.notes.changed_text | text | YES | 44 | 0 | 0 |
| clinical.notes.clinical_context | jsonb | YES | 44 | 40 | 40 |
| clinical.notes.documentation_status | text | NO | 44 | 44 | 44 |
| clinical.notes.saved_at | timestamp with time zone | YES | 44 | 40 | 40 |
| clinical.notes.updated_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.notes.author_stamp | jsonb | YES | 44 | 40 | 40 |
| clinical.notifications.id | uuid | NO | 0 | 0 | 0 |
| clinical.notifications.user_id | uuid | NO | 0 | 0 | 0 |
| clinical.notifications.type | text | NO | 0 | 0 | 0 |
| clinical.notifications.payload | jsonb | NO | 0 | 0 | 0 |
| clinical.notifications.read_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.notifications.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.notifications.acknowledged_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.notifications.closed_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.nurse_handover_items.id | uuid | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.session_id | uuid | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.patient_name | text | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.ward | text | YES | 40 | 40 | 40 |
| clinical.nurse_handover_items.bed | text | YES | 40 | 40 | 40 |
| clinical.nurse_handover_items.snapshot | jsonb | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.handover_notes | text | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.status | text | NO | 40 | 40 | 40 |
| clinical.nurse_handover_items.checklist | jsonb | YES | 40 | 0 | 0 |
| clinical.nurse_handover_items.discrepancies | text | YES | 40 | 0 | 0 |
| clinical.nurse_handover_items.accepted_at | timestamp with time zone | YES | 40 | 0 | 0 |
| clinical.nurse_handover_questions.id | uuid | NO | 0 | 0 | 0 |
| clinical.nurse_handover_questions.item_id | uuid | NO | 0 | 0 | 0 |
| clinical.nurse_handover_questions.author_id | uuid | NO | 0 | 0 | 0 |
| clinical.nurse_handover_questions.body | text | NO | 0 | 0 | 0 |
| clinical.nurse_handover_questions.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.nurse_handover_sessions.id | uuid | NO | 11 | 11 | 11 |
| clinical.nurse_handover_sessions.outgoing_nurse_id | uuid | NO | 11 | 11 | 11 |
| clinical.nurse_handover_sessions.incoming_nurse_id | uuid | NO | 11 | 11 | 11 |
| clinical.nurse_handover_sessions.status | text | NO | 11 | 11 | 11 |
| clinical.nurse_handover_sessions.created_at | timestamp with time zone | NO | 11 | 11 | 11 |
| clinical.nurse_handover_sessions.sent_at | timestamp with time zone | YES | 11 | 0 | 0 |
| clinical.nurse_handover_sessions.completed_at | timestamp with time zone | YES | 11 | 0 | 0 |
| clinical.nursing_assessments.id | uuid | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.admission_id | uuid | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.assessed_by | uuid | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.assessed_at | timestamp with time zone | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.arrival_source | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.transport_mode | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.identity_verified | boolean | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.allergy_verified | boolean | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.language | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.belongings | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.dependence | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.skin | text | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.vulnerabilities | jsonb | NO | 58 | 58 | 5 |
| clinical.nursing_assessments.devices | jsonb | NO | 58 | 58 | 7 |
| clinical.nursing_assessments.pain_score | integer | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.pain_site | text | NO | 58 | 58 | 45 |
| clinical.nursing_assessments.morse | jsonb | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.morse_score | integer | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.braden | jsonb | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.braden_score | integer | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.must | jsonb | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.must_score | integer | NO | 58 | 58 | 58 |
| clinical.nursing_assessments.care_plan | jsonb | NO | 58 | 58 | 49 |
| clinical.nursing_assessments.reassess_by | timestamp with time zone | NO | 58 | 58 | 58 |
| clinical.nursing_care_plan_items.id | uuid | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.admission_id | uuid | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.problem | text | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.intervention | text | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.status | text | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.revision | integer | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.created_by | uuid | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.created_at | timestamp with time zone | NO | 43 | 43 | 43 |
| clinical.nursing_care_plan_items.updated_by | uuid | YES | 43 | 0 | 0 |
| clinical.nursing_care_plan_items.updated_at | timestamp with time zone | YES | 43 | 0 | 0 |
| clinical.nursing_care_plan_items.resolution_reason | text | YES | 43 | 0 | 0 |
| clinical.nursing_recurring_tasks.id | uuid | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.admission_id | uuid | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.source_assessment_id | uuid | YES | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.description | text | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.interval_minutes | integer | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.due_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.last_completed_at | timestamp with time zone | YES | 44 | 0 | 0 |
| clinical.nursing_recurring_tasks.status | text | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.created_by | uuid | NO | 44 | 44 | 44 |
| clinical.nursing_recurring_tasks.created_at | timestamp with time zone | NO | 44 | 44 | 44 |
| clinical.nursing_sbar_calls.id | uuid | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.admission_id | uuid | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.called_by | uuid | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.doctor_id | uuid | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.situation | text | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.background | text | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.assessment | text | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.request | text | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.status | text | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.created_at | timestamp with time zone | NO | 10 | 10 | 10 |
| clinical.nursing_sbar_calls.acknowledged_at | timestamp with time zone | YES | 10 | 0 | 0 |
| clinical.nursing_sbar_calls.reply | text | YES | 10 | 0 | 0 |
| clinical.nursing_sbar_calls.closed_by | uuid | YES | 10 | 0 | 0 |
| clinical.nursing_sbar_calls.closed_at | timestamp with time zone | YES | 10 | 0 | 0 |
| clinical.nursing_task_completions.id | uuid | NO | 40 | 40 | 40 |
| clinical.nursing_task_completions.task_id | uuid | NO | 40 | 40 | 40 |
| clinical.nursing_task_completions.completed_by | uuid | NO | 40 | 40 | 40 |
| clinical.nursing_task_completions.completed_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.nursing_task_completions.previous_due_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.observation_schedules.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.observation_schedules.frequency_minutes | integer | NO | 40 | 40 | 40 |
| clinical.observation_schedules.next_due_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.observation_schedules.source | text | NO | 40 | 40 | 40 |
| clinical.observation_schedules.reason | text | YES | 40 | 0 | 0 |
| clinical.observation_schedules.policy_version | text | NO | 40 | 40 | 40 |
| clinical.observation_schedules.updated_by | uuid | YES | 40 | 40 | 40 |
| clinical.observation_schedules.updated_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.order_set_applications.id | uuid | NO | 0 | 0 | 0 |
| clinical.order_set_applications.actor_user_id | uuid | NO | 0 | 0 | 0 |
| clinical.order_set_applications.idempotency_key | text | NO | 0 | 0 | 0 |
| clinical.order_set_applications.request_hash | text | NO | 0 | 0 | 0 |
| clinical.order_set_applications.order_ids | ARRAY | NO | 0 | 0 | 0 |
| clinical.order_set_applications.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.order_set_items.id | uuid | NO | 0 | 0 | 0 |
| clinical.order_set_items.order_set_id | uuid | NO | 0 | 0 | 0 |
| clinical.order_set_items.position | integer | NO | 0 | 0 | 0 |
| clinical.order_set_items.kind | text | NO | 0 | 0 | 0 |
| clinical.order_set_items.priority | text | NO | 0 | 0 | 0 |
| clinical.order_set_items.payload | jsonb | NO | 0 | 0 | 0 |
| clinical.order_sets.id | uuid | NO | 0 | 0 | 0 |
| clinical.order_sets.name | text | NO | 0 | 0 | 0 |
| clinical.order_sets.description | text | YES | 0 | 0 | 0 |
| clinical.order_sets.active | boolean | NO | 0 | 0 | 0 |
| clinical.order_sets.created_by | uuid | NO | 0 | 0 | 0 |
| clinical.order_sets.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.orders.id | uuid | NO | 86 | 86 | 86 |
| clinical.orders.admission_id | uuid | NO | 86 | 86 | 86 |
| clinical.orders.kind | text | NO | 86 | 86 | 86 |
| clinical.orders.payload | jsonb | NO | 86 | 86 | 86 |
| clinical.orders.status | text | NO | 86 | 86 | 86 |
| clinical.orders.revision | bigint | NO | 86 | 86 | 86 |
| clinical.orders.created_by | uuid | NO | 86 | 86 | 86 |
| clinical.orders.created_at | timestamp with time zone | NO | 86 | 86 | 86 |
| clinical.orders.confirmed_by | uuid | YES | 86 | 86 | 86 |
| clinical.orders.confirmed_at | timestamp with time zone | YES | 86 | 86 | 86 |
| clinical.orders.priority | text | NO | 86 | 86 | 86 |
| clinical.orders.acknowledged_by | uuid | YES | 86 | 40 | 40 |
| clinical.orders.acknowledged_at | timestamp with time zone | YES | 86 | 40 | 40 |
| clinical.orders.closed_by | uuid | YES | 86 | 0 | 0 |
| clinical.orders.closed_at | timestamp with time zone | YES | 86 | 0 | 0 |
| clinical.orders.close_reason | text | YES | 86 | 0 | 0 |
| clinical.orders.order_set_item_id | uuid | YES | 86 | 0 | 0 |
| clinical.orders.requires_approval | boolean | NO | 86 | 86 | 86 |
| clinical.orders.approval_status | text | NO | 86 | 86 | 86 |
| clinical.orders.approval_by | uuid | YES | 86 | 0 | 0 |
| clinical.orders.approval_at | timestamp with time zone | YES | 86 | 0 | 0 |
| clinical.orders.approval_reason | text | YES | 86 | 0 | 0 |
| clinical.orders.cross_referral_id | uuid | YES | 86 | 0 | 0 |
| clinical.orders.consultant_round_id | uuid | YES | 86 | 0 | 0 |
| clinical.orders.advised_by | uuid | YES | 86 | 0 | 0 |
| clinical.patient_chat_attachments.id | uuid | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.message_id | uuid | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.storage_key | text | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.filename | text | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.content_type | text | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.byte_size | integer | NO | 0 | 0 | 0 |
| clinical.patient_chat_attachments.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.patient_chat_mentions.message_id | uuid | NO | 0 | 0 | 0 |
| clinical.patient_chat_mentions.user_id | uuid | NO | 0 | 0 | 0 |
| clinical.patient_chat_messages.id | uuid | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.patient_id | uuid | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.author_id | uuid | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.body | text | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.revision | integer | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.patient_chat_messages.edited_at | timestamp with time zone | YES | 40 | 0 | 0 |
| clinical.patient_chat_revisions.message_id | uuid | NO | 0 | 0 | 0 |
| clinical.patient_chat_revisions.revision | integer | NO | 0 | 0 | 0 |
| clinical.patient_chat_revisions.body | text | NO | 0 | 0 | 0 |
| clinical.patient_chat_revisions.mention_ids | ARRAY | NO | 0 | 0 | 0 |
| clinical.patient_chat_revisions.superseded_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.patient_contacts.id | uuid | NO | 54 | 54 | 54 |
| clinical.patient_contacts.patient_id | uuid | NO | 54 | 54 | 54 |
| clinical.patient_contacts.type | text | NO | 54 | 54 | 54 |
| clinical.patient_contacts.label | text | YES | 54 | 54 | 54 |
| clinical.patient_contacts.value | text | NO | 54 | 54 | 54 |
| clinical.patient_contacts.is_primary | boolean | NO | 54 | 54 | 54 |
| clinical.patient_contacts.created_at | timestamp with time zone | NO | 54 | 54 | 54 |
| clinical.patient_coverage.id | uuid | NO | 54 | 54 | 54 |
| clinical.patient_coverage.patient_id | uuid | NO | 54 | 54 | 54 |
| clinical.patient_coverage.payer_name | text | NO | 54 | 54 | 54 |
| clinical.patient_coverage.policy_number | text | NO | 54 | 54 | 54 |
| clinical.patient_coverage.member_id | text | YES | 54 | 54 | 54 |
| clinical.patient_coverage.valid_from | date | YES | 54 | 54 | 54 |
| clinical.patient_coverage.valid_until | date | YES | 54 | 54 | 54 |
| clinical.patient_coverage.is_primary | boolean | NO | 54 | 54 | 54 |
| clinical.patient_coverage.created_at | timestamp with time zone | NO | 54 | 54 | 54 |
| clinical.patient_identifiers.id | uuid | NO | 58 | 58 | 58 |
| clinical.patient_identifiers.patient_id | uuid | NO | 58 | 58 | 58 |
| clinical.patient_identifiers.type | text | NO | 58 | 58 | 58 |
| clinical.patient_identifiers.value | text | NO | 58 | 58 | 58 |
| clinical.patient_identifiers.issuer | text | YES | 58 | 58 | 58 |
| clinical.patient_identifiers.created_at | timestamp with time zone | NO | 58 | 58 | 58 |
| clinical.patient_movements.id | uuid | NO | 3 | 3 | 3 |
| clinical.patient_movements.admission_id | uuid | NO | 3 | 3 | 3 |
| clinical.patient_movements.movement_type | text | NO | 3 | 3 | 3 |
| clinical.patient_movements.destination_unit_id | uuid | YES | 3 | 0 | 0 |
| clinical.patient_movements.destination_area | text | YES | 3 | 3 | 3 |
| clinical.patient_movements.source_bed_id | uuid | YES | 3 | 3 | 3 |
| clinical.patient_movements.destination_bed_id | uuid | YES | 3 | 0 | 0 |
| clinical.patient_movements.reason | text | NO | 3 | 3 | 3 |
| clinical.patient_movements.escort | text | NO | 3 | 3 | 3 |
| clinical.patient_movements.equipment | jsonb | NO | 3 | 3 | 3 |
| clinical.patient_movements.status | text | NO | 3 | 3 | 3 |
| clinical.patient_movements.requested_by | uuid | NO | 3 | 3 | 3 |
| clinical.patient_movements.requested_at | timestamp with time zone | NO | 3 | 3 | 3 |
| clinical.patient_movements.reserved_by | uuid | YES | 3 | 0 | 0 |
| clinical.patient_movements.departed_at | timestamp with time zone | YES | 3 | 3 | 3 |
| clinical.patient_movements.completed_at | timestamp with time zone | YES | 3 | 3 | 3 |
| clinical.patient_weights.id | uuid | NO | 43 | 43 | 43 |
| clinical.patient_weights.admission_id | uuid | NO | 43 | 43 | 43 |
| clinical.patient_weights.weight_kg | double precision | NO | 43 | 43 | 43 |
| clinical.patient_weights.measured_at | timestamp with time zone | NO | 43 | 43 | 43 |
| clinical.patient_weights.recorded_at | timestamp with time zone | NO | 43 | 43 | 43 |
| clinical.patient_weights.recorded_by | uuid | NO | 43 | 43 | 43 |
| clinical.patients.id | uuid | NO | 54 | 54 | 54 |
| clinical.patients.name | text | NO | 54 | 54 | 54 |
| clinical.patients.dob | date | NO | 54 | 54 | 54 |
| clinical.patients.sex | text | YES | 54 | 54 | 54 |
| clinical.patients.blood_group | text | YES | 54 | 54 | 54 |
| clinical.patients.phone | text | YES | 54 | 54 | 54 |
| clinical.patients.address | text | YES | 54 | 54 | 54 |
| clinical.patients.abha_id | text | YES | 54 | 54 | 54 |
| clinical.patients.revision | bigint | NO | 54 | 54 | 54 |
| clinical.patients.created_at | timestamp with time zone | NO | 54 | 54 | 54 |
| clinical.patients.created_by | uuid | YES | 54 | 54 | 54 |
| clinical.patients.allergies | jsonb | NO | 54 | 54 | 8 |
| clinical.patients.uhid | text | NO | 54 | 54 | 54 |
| clinical.shift_events.id | uuid | NO | 40 | 40 | 40 |
| clinical.shift_events.admission_id | uuid | NO | 40 | 40 | 40 |
| clinical.shift_events.body | text | NO | 40 | 40 | 40 |
| clinical.shift_events.logged_by | uuid | NO | 40 | 40 | 40 |
| clinical.shift_events.logged_at | timestamp with time zone | NO | 40 | 40 | 40 |
| clinical.staff_assignments.id | uuid | NO | 127 | 127 | 127 |
| clinical.staff_assignments.admission_id | uuid | NO | 127 | 127 | 127 |
| clinical.staff_assignments.user_id | uuid | NO | 127 | 127 | 127 |
| clinical.staff_assignments.assignment_type | text | NO | 127 | 127 | 127 |
| clinical.staff_assignments.starts_at | timestamp with time zone | NO | 127 | 127 | 127 |
| clinical.staff_assignments.ends_at | timestamp with time zone | YES | 127 | 0 | 0 |
| clinical.staff_assignments.assigned_by | uuid | YES | 127 | 127 | 127 |
| clinical.tasks.id | uuid | NO | 45 | 45 | 45 |
| clinical.tasks.order_id | uuid | NO | 45 | 45 | 45 |
| clinical.tasks.admission_id | uuid | NO | 45 | 45 | 45 |
| clinical.tasks.due_at | timestamp with time zone | YES | 45 | 45 | 45 |
| clinical.tasks.status | text | NO | 45 | 45 | 45 |
| clinical.tasks.completed_by | uuid | YES | 45 | 14 | 14 |
| clinical.tasks.completed_at | timestamp with time zone | YES | 45 | 14 | 14 |
| clinical.tasks.revision | bigint | NO | 45 | 45 | 45 |
| clinical.tasks.created_at | timestamp with time zone | NO | 45 | 45 | 45 |
| clinical.transfer_requests.id | uuid | NO | 0 | 0 | 0 |
| clinical.transfer_requests.admission_id | uuid | NO | 0 | 0 | 0 |
| clinical.transfer_requests.from_doctor_id | uuid | NO | 0 | 0 | 0 |
| clinical.transfer_requests.to_doctor_id | uuid | NO | 0 | 0 | 0 |
| clinical.transfer_requests.status | text | NO | 0 | 0 | 0 |
| clinical.transfer_requests.message | text | YES | 0 | 0 | 0 |
| clinical.transfer_requests.created_at | timestamp with time zone | NO | 0 | 0 | 0 |
| clinical.transfer_requests.resolved_at | timestamp with time zone | YES | 0 | 0 | 0 |
| clinical.vitals.id | uuid | NO | 240 | 240 | 240 |
| clinical.vitals.admission_id | uuid | NO | 240 | 240 | 240 |
| clinical.vitals.recorded_by | uuid | NO | 240 | 240 | 240 |
| clinical.vitals.recorded_at | timestamp with time zone | NO | 240 | 240 | 240 |
| clinical.vitals.bp_systolic | integer | YES | 240 | 240 | 240 |
| clinical.vitals.bp_diastolic | integer | YES | 240 | 240 | 240 |
| clinical.vitals.heart_rate | integer | YES | 240 | 240 | 240 |
| clinical.vitals.spo2 | double precision | YES | 240 | 240 | 240 |
| clinical.vitals.resp_rate | integer | YES | 240 | 240 | 240 |
| clinical.vitals.temperature | double precision | YES | 240 | 240 | 240 |
| clinical.vitals.glucose | integer | YES | 240 | 240 | 240 |
| clinical.vitals.on_supplemental_oxygen | boolean | YES | 240 | 240 | 240 |
| clinical.vitals.consciousness | text | YES | 240 | 240 | 240 |
| clinical.vitals.news2_score | integer | YES | 240 | 240 | 240 |
| clinical.vitals.news2_escalation | text | YES | 240 | 240 | 240 |
| clinical.vitals.news2_component_scores | jsonb | YES | 240 | 240 | 240 |
| clinical.vitals.news2_rule_version | text | YES | 240 | 240 | 240 |
| clinical.vitals.event_order | bigint | NO | 240 | 240 | 240 |
| finance.claim_events.id | uuid | NO | 3 | 3 | 3 |
| finance.claim_events.claim_id | uuid | NO | 3 | 3 | 3 |
| finance.claim_events.type | text | NO | 3 | 3 | 3 |
| finance.claim_events.note | text | NO | 3 | 3 | 3 |
| finance.claim_events.actor_id | uuid | NO | 3 | 3 | 3 |
| finance.claim_events.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| finance.claim_queries.id | uuid | NO | 3 | 3 | 3 |
| finance.claim_queries.claim_id | uuid | NO | 3 | 3 | 3 |
| finance.claim_queries.question | text | NO | 3 | 3 | 3 |
| finance.claim_queries.reply | text | YES | 3 | 0 | 0 |
| finance.claim_queries.raised_by | uuid | NO | 3 | 3 | 3 |
| finance.claim_queries.raised_at | timestamp with time zone | NO | 3 | 3 | 3 |
| finance.claim_queries.replied_by | uuid | YES | 3 | 0 | 0 |
| finance.claim_queries.replied_at | timestamp with time zone | YES | 3 | 0 | 0 |
| finance.claims.id | uuid | NO | 40 | 40 | 40 |
| finance.claims.admission_id | uuid | NO | 40 | 40 | 40 |
| finance.claims.coverage_id | uuid | NO | 40 | 40 | 40 |
| finance.claims.status | text | NO | 40 | 40 | 40 |
| finance.claims.currency | text | NO | 40 | 40 | 40 |
| finance.claims.approved_limit | numeric | NO | 40 | 40 | 40 |
| finance.claims.current_usage | numeric | NO | 40 | 40 | 40 |
| finance.claims.estimate | numeric | NO | 40 | 40 | 40 |
| finance.claims.final_approved | boolean | NO | 40 | 40 | 40 |
| finance.claims.enhancement_pending | boolean | NO | 40 | 40 | 40 |
| finance.claims.revision | integer | NO | 40 | 40 | 40 |
| finance.claims.created_by | uuid | NO | 40 | 40 | 40 |
| finance.claims.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| finance.claims.updated_at | timestamp with time zone | NO | 40 | 40 | 40 |
| finance.deposits.id | uuid | NO | 40 | 40 | 40 |
| finance.deposits.admission_id | uuid | NO | 40 | 40 | 40 |
| finance.deposits.amount | numeric | NO | 40 | 40 | 40 |
| finance.deposits.currency | text | NO | 40 | 40 | 40 |
| finance.deposits.reference | text | NO | 40 | 40 | 40 |
| finance.deposits.recorded_by | uuid | NO | 40 | 40 | 40 |
| finance.deposits.created_at | timestamp with time zone | NO | 40 | 40 | 40 |
| forms.instance_versions.id | uuid | NO | 3 | 3 | 3 |
| forms.instance_versions.instance_id | uuid | NO | 3 | 3 | 3 |
| forms.instance_versions.template_version_id | uuid | NO | 3 | 3 | 3 |
| forms.instance_versions.version | integer | NO | 3 | 3 | 3 |
| forms.instance_versions.status | text | NO | 3 | 3 | 3 |
| forms.instance_versions.fields | jsonb | NO | 3 | 3 | 3 |
| forms.instance_versions.form_values | jsonb | NO | 3 | 3 | 3 |
| forms.instance_versions.source_snapshot | jsonb | NO | 3 | 3 | 1 |
| forms.instance_versions.revision | integer | NO | 3 | 3 | 3 |
| forms.instance_versions.created_by | uuid | NO | 3 | 3 | 3 |
| forms.instance_versions.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| forms.instance_versions.finalized_by | uuid | YES | 3 | 0 | 0 |
| forms.instance_versions.finalized_at | timestamp with time zone | YES | 3 | 0 | 0 |
| forms.instances.id | uuid | NO | 3 | 3 | 3 |
| forms.instances.patient_id | uuid | NO | 3 | 3 | 3 |
| forms.instances.admission_id | uuid | YES | 3 | 3 | 3 |
| forms.instances.template_id | uuid | NO | 3 | 3 | 3 |
| forms.instances.created_by | uuid | NO | 3 | 3 | 3 |
| forms.instances.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| forms.signatures.id | uuid | NO | 0 | 0 | 0 |
| forms.signatures.version_id | uuid | NO | 0 | 0 | 0 |
| forms.signatures.field_key | text | NO | 0 | 0 | 0 |
| forms.signatures.role | text | NO | 0 | 0 | 0 |
| forms.signatures.signer_name | text | NO | 0 | 0 | 0 |
| forms.signatures.captured_by | uuid | NO | 0 | 0 | 0 |
| forms.signatures.signed_at | timestamp with time zone | NO | 0 | 0 | 0 |
| forms.signatures.strokes | jsonb | YES | 0 | 0 | 0 |
| forms.template_versions.id | uuid | NO | 3 | 3 | 3 |
| forms.template_versions.template_id | uuid | NO | 3 | 3 | 3 |
| forms.template_versions.version | integer | NO | 3 | 3 | 3 |
| forms.template_versions.fields | jsonb | NO | 3 | 3 | 1 |
| forms.template_versions.synthetic | boolean | NO | 3 | 3 | 3 |
| forms.template_versions.created_by | uuid | YES | 3 | 3 | 3 |
| forms.template_versions.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| forms.templates.id | uuid | NO | 3 | 3 | 3 |
| forms.templates.name | text | NO | 3 | 3 | 3 |
| forms.templates.category | text | NO | 3 | 3 | 3 |
| forms.templates.created_by | uuid | YES | 3 | 1 | 1 |
| forms.templates.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| forms.templates.visible | boolean | NO | 3 | 3 | 3 |
| opd.diagnosis_catalog.code | text | NO | 7 | 7 | 7 |
| opd.diagnosis_catalog.description | text | NO | 7 | 7 | 7 |
| opd.diagnosis_catalog.synthetic | boolean | NO | 7 | 7 | 7 |
| opd.diagnosis_catalog.visible | boolean | NO | 7 | 7 | 7 |
| opd.dispatches.id | uuid | NO | 18 | 18 | 18 |
| opd.dispatches.visit_id | uuid | NO | 18 | 18 | 18 |
| opd.dispatches.kind | text | NO | 18 | 18 | 18 |
| opd.dispatches.status | text | NO | 18 | 18 | 18 |
| opd.dispatches.created_at | timestamp with time zone | NO | 18 | 18 | 18 |
| opd.dispatches.completed_at | timestamp with time zone | YES | 18 | 0 | 0 |
| opd.dispatches.completed_by | uuid | YES | 18 | 0 | 0 |
| opd.investigation_catalog.code | text | NO | 6 | 6 | 6 |
| opd.investigation_catalog.name | text | NO | 6 | 6 | 6 |
| opd.investigation_catalog.price | numeric | NO | 6 | 6 | 6 |
| opd.investigation_catalog.currency | text | NO | 6 | 6 | 6 |
| opd.investigation_catalog.synthetic | boolean | NO | 6 | 6 | 6 |
| opd.investigation_catalog.visible | boolean | NO | 6 | 6 | 6 |
| opd.prescriptions.id | uuid | NO | 10 | 10 | 10 |
| opd.prescriptions.visit_id | uuid | NO | 10 | 10 | 10 |
| opd.prescriptions.medication_id | uuid | NO | 10 | 10 | 10 |
| opd.prescriptions.dose | text | NO | 10 | 10 | 10 |
| opd.prescriptions.route | text | NO | 10 | 10 | 10 |
| opd.prescriptions.frequency | text | NO | 10 | 10 | 10 |
| opd.prescriptions.duration | text | NO | 10 | 10 | 10 |
| opd.prescriptions.allergy_override_reason | text | YES | 10 | 0 | 0 |
| opd.prescriptions.created_by | uuid | NO | 10 | 10 | 10 |
| opd.prescriptions.created_at | timestamp with time zone | NO | 10 | 10 | 10 |
| opd.visit_charges.visit_id | uuid | NO | 10 | 10 | 10 |
| opd.visit_charges.consultation_amount | numeric | NO | 10 | 10 | 10 |
| opd.visit_charges.investigation_amount | numeric | NO | 10 | 10 | 10 |
| opd.visit_charges.total_amount | numeric | NO | 10 | 10 | 10 |
| opd.visit_charges.currency | text | NO | 10 | 10 | 10 |
| opd.visit_charges.calculated_at | timestamp with time zone | NO | 10 | 10 | 10 |
| opd.visit_diagnoses.id | uuid | NO | 10 | 10 | 10 |
| opd.visit_diagnoses.visit_id | uuid | NO | 10 | 10 | 10 |
| opd.visit_diagnoses.code | text | NO | 10 | 10 | 10 |
| opd.visit_investigations.id | uuid | NO | 10 | 10 | 10 |
| opd.visit_investigations.visit_id | uuid | NO | 10 | 10 | 10 |
| opd.visit_investigations.code | text | NO | 10 | 10 | 10 |
| opd.visits.id | uuid | NO | 18 | 18 | 18 |
| opd.visits.patient_id | uuid | NO | 18 | 18 | 18 |
| opd.visits.token | text | NO | 18 | 18 | 18 |
| opd.visits.status | text | NO | 18 | 18 | 18 |
| opd.visits.chief_complaints | jsonb | NO | 18 | 18 | 18 |
| opd.visits.patient_notes | text | NO | 18 | 18 | 17 |
| opd.visits.reported_medications | text | NO | 18 | 18 | 15 |
| opd.visits.chronic_conditions | text | NO | 18 | 18 | 15 |
| opd.visits.triage | jsonb | YES | 18 | 14 | 14 |
| opd.visits.consultation_note | text | NO | 18 | 18 | 8 |
| opd.visits.follow_up | text | NO | 18 | 18 | 18 |
| opd.visits.created_by | uuid | NO | 18 | 18 | 18 |
| opd.visits.created_at | timestamp with time zone | NO | 18 | 18 | 18 |
| opd.visits.signed_by | uuid | YES | 18 | 8 | 8 |
| opd.visits.signed_at | timestamp with time zone | YES | 18 | 8 | 8 |
| opd.visits.revision | integer | NO | 18 | 18 | 18 |
| organization.bed_reservations.id | uuid | NO | 0 | 0 | 0 |
| organization.bed_reservations.bed_id | uuid | NO | 0 | 0 | 0 |
| organization.bed_reservations.movement_id | uuid | NO | 0 | 0 | 0 |
| organization.bed_reservations.reserved_by | uuid | NO | 0 | 0 | 0 |
| organization.bed_reservations.reserved_at | timestamp with time zone | NO | 0 | 0 | 0 |
| organization.bed_reservations.released_at | timestamp with time zone | YES | 0 | 0 | 0 |
| organization.beds.id | uuid | NO | 45 | 45 | 45 |
| organization.beds.room_id | uuid | NO | 45 | 45 | 45 |
| organization.beds.label | text | NO | 45 | 45 | 45 |
| organization.beds.operational_state | text | NO | 45 | 45 | 45 |
| organization.beds.created_at | timestamp with time zone | NO | 45 | 45 | 45 |
| organization.departments.id | uuid | NO | 1 | 1 | 1 |
| organization.departments.facility_id | uuid | NO | 1 | 1 | 1 |
| organization.departments.code | text | NO | 1 | 1 | 1 |
| organization.departments.name | text | NO | 1 | 1 | 1 |
| organization.departments.created_at | timestamp with time zone | NO | 1 | 1 | 1 |
| organization.facilities.id | uuid | NO | 1 | 1 | 1 |
| organization.facilities.code | text | NO | 1 | 1 | 1 |
| organization.facilities.name | text | NO | 1 | 1 | 1 |
| organization.facilities.created_at | timestamp with time zone | NO | 1 | 1 | 1 |
| organization.rooms.id | uuid | NO | 1 | 1 | 1 |
| organization.rooms.ward_id | uuid | NO | 1 | 1 | 1 |
| organization.rooms.name | text | NO | 1 | 1 | 1 |
| organization.rooms.created_at | timestamp with time zone | NO | 1 | 1 | 1 |
| organization.units.id | uuid | NO | 1 | 1 | 1 |
| organization.units.department_id | uuid | NO | 1 | 1 | 1 |
| organization.units.code | text | NO | 1 | 1 | 1 |
| organization.units.name | text | NO | 1 | 1 | 1 |
| organization.units.kind | text | NO | 1 | 1 | 1 |
| organization.units.created_at | timestamp with time zone | NO | 1 | 1 | 1 |
| organization.wards.id | uuid | NO | 1 | 1 | 1 |
| organization.wards.unit_id | uuid | NO | 1 | 1 | 1 |
| organization.wards.name | text | NO | 1 | 1 | 1 |
| organization.wards.created_at | timestamp with time zone | NO | 1 | 1 | 1 |
| public._migrations.id | integer | NO | 65 | 65 | 65 |
| public._migrations.name | text | NO | 65 | 65 | 65 |
| public._migrations.applied_at | timestamp without time zone | NO | 65 | 65 | 65 |
| staff.sessions.id | uuid | NO | 3 | 3 | 3 |
| staff.sessions.user_id | uuid | NO | 3 | 3 | 3 |
| staff.sessions.token | text | NO | 3 | 3 | 3 |
| staff.sessions.created_at | timestamp with time zone | NO | 3 | 3 | 3 |
| staff.sessions.expires_at | timestamp with time zone | NO | 3 | 3 | 3 |
| staff.sessions.selected_shift | text | YES | 3 | 1 | 1 |
| staff.shift_units.shift_id | uuid | NO | 14 | 14 | 14 |
| staff.shift_units.unit_id | uuid | NO | 14 | 14 | 14 |
| staff.shifts.id | uuid | NO | 14 | 14 | 14 |
| staff.shifts.user_id | uuid | NO | 14 | 14 | 14 |
| staff.shifts.starts_at | timestamp with time zone | NO | 14 | 14 | 14 |
| staff.shifts.ends_at | timestamp with time zone | NO | 14 | 14 | 14 |
| staff.shifts.status | text | NO | 14 | 14 | 14 |
| staff.shifts.created_by | uuid | YES | 14 | 14 | 14 |
| staff.shifts.created_at | timestamp with time zone | NO | 14 | 14 | 14 |
| staff.unit_memberships.user_id | uuid | NO | 18 | 18 | 18 |
| staff.unit_memberships.unit_id | uuid | NO | 18 | 18 | 18 |
| staff.unit_memberships.is_primary | boolean | NO | 18 | 18 | 18 |
| staff.unit_memberships.created_at | timestamp with time zone | NO | 18 | 18 | 18 |
| staff.user_credentials.user_id | uuid | NO | 41 | 41 | 41 |
| staff.user_credentials.email | text | NO | 41 | 41 | 41 |
| staff.user_credentials.password_hash | text | NO | 41 | 41 | 41 |
| staff.user_credentials.updated_at | timestamp with time zone | NO | 41 | 41 | 41 |
| staff.users.id | uuid | NO | 41 | 41 | 41 |
| staff.users.name | text | NO | 41 | 41 | 41 |
| staff.users.role | text | NO | 41 | 41 | 41 |
| staff.users.registration_number | text | YES | 41 | 41 | 41 |
| staff.users.specialization | text | YES | 41 | 41 | 41 |
| staff.users.phone | text | YES | 41 | 41 | 41 |
| staff.users.created_at | timestamp with time zone | NO | 41 | 41 | 41 |
| staff.users.disabled_at | timestamp with time zone | YES | 41 | 0 | 0 |
| staff.users.current_area | character varying | YES | 41 | 0 | 0 |
| staff.users.last_seen_at | timestamp with time zone | YES | 41 | 2 | 2 |
| staff.users.job_role | text | NO | 41 | 41 | 41 |
| staff.users.app_access_enabled | boolean | NO | 41 | 41 | 41 |
| test_data.datasets.dataset_id | text | NO | 1 | 1 | 1 |
| test_data.datasets.snapshot_at | timestamp with time zone | NO | 1 | 1 | 1 |
| test_data.seed_records.dataset_id | text | NO | 591 | 591 | 591 |
| test_data.seed_records.table_name | text | NO | 591 | 591 | 591 |
| test_data.seed_records.record_key | text | NO | 591 | 591 | 591 |
| test_data.seed_records.seeded_at | timestamp with time zone | NO | 591 | 591 | 591 |

*Non-empty excludes SQL NULL, empty text, empty JSON arrays/objects, and JSON null. Zero and false are legitimate populated values.

Tables with records: 77/95. Total columns: 796. Frontend source files indexed: 108.
