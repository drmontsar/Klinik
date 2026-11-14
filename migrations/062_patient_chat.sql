-- up
-- One append-only conversation per patient, retained across admissions.
CREATE TABLE clinical.patient_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES clinical.patients(id),
  author_id uuid NOT NULL REFERENCES staff.users(id),
  body text NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 4000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz
);
CREATE INDEX patient_chat_messages_page ON clinical.patient_chat_messages (patient_id, created_at DESC, id DESC);

CREATE TABLE clinical.patient_chat_mentions (
  message_id uuid NOT NULL REFERENCES clinical.patient_chat_messages(id),
  user_id uuid NOT NULL REFERENCES staff.users(id),
  PRIMARY KEY (message_id, user_id)
);

-- Save the *previous* revision before each edit; old clinical communication is never lost.
CREATE TABLE clinical.patient_chat_revisions (
  message_id uuid NOT NULL REFERENCES clinical.patient_chat_messages(id),
  revision integer NOT NULL,
  body text NOT NULL,
  mention_ids uuid[] NOT NULL,
  superseded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, revision)
);

CREATE TABLE clinical.patient_chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES clinical.patient_chat_messages(id),
  storage_key text NOT NULL UNIQUE,
  filename text NOT NULL,
  content_type text NOT NULL,
  byte_size integer NOT NULL CHECK (byte_size BETWEEN 1 AND 10485760),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patient_chat_attachments_message ON clinical.patient_chat_attachments(message_id);

-- down
DROP TABLE clinical.patient_chat_attachments;
DROP TABLE clinical.patient_chat_revisions;
DROP TABLE clinical.patient_chat_mentions;
DROP TABLE clinical.patient_chat_messages;
