-- Student corrections to the directory, and the age record that decides what an
-- account may reach.

-- ---------------------------------------------------------------------------
-- Directory corrections
--
-- The only mechanism that keeps a campus directory alive. Feeds know which
-- clubs are registered; they never know which ones stopped meeting in March.
-- ---------------------------------------------------------------------------

create table if not exists cq_activity_reports (
  id text primary key default ('rep_' || gen_random_uuid()::text),
  campus_id text not null,
  -- Null for a 'missing' report, which by definition has no row yet.
  activity_id text references cq_activities (id) on delete set null,
  kind text not null check (kind in ('defunct', 'details_wrong', 'still_active', 'missing')),
  detail text not null,
  suggested_name text,

  -- A hash, not a mailing list. Deduplicating and rate limiting one student
  -- needs a stable key; the address itself is kept only on opt-in.
  reporter_hash text not null,
  reporter_email text,
  created_at timestamptz not null default now(),

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'duplicate')),
  resolved_at timestamptz,
  resolved_by text,
  resolution_note text,
  -- Whether this confirmation has already been counted toward a free month.
  credited boolean not null default false
);

comment on table cq_activity_reports is
  'A report never changes a listing by itself. One student must not be able to delist a rival society, and a hundred students saying the same thing can be one person with a hundred addresses.';
comment on column cq_activity_reports.credited is
  'Credit lands on a confirmed report, never on submission, so a fabricated report costs time and earns nothing.';

-- One student's ledger, and the duplicate check on submission.
create index if not exists cq_reports_reporter_idx
  on cq_activity_reports (reporter_hash, status);
-- The review queue, oldest first.
create index if not exists cq_reports_queue_idx
  on cq_activity_reports (campus_id, status, created_at);

-- A student may not file the same complaint about the same listing twice.
-- Rejected reports are excluded so a corrected resubmission is still possible.
create unique index if not exists cq_reports_no_duplicates
  on cq_activity_reports (reporter_hash, activity_id, kind)
  where status <> 'rejected' and activity_id is not null;

alter table cq_activity_reports enable row level security;
-- No policy: reports are written and read by the service role only. A student
-- seeing other students' reports would turn the queue into a noticeboard.

-- ---------------------------------------------------------------------------
-- Age and guardian consent
--
-- Stored on the Genius Mining session row, which is already the per-student
-- record. The gate is per capability rather than per site: an under-18 with
-- guardian consent gets the activity directory and never the instrument.
-- ---------------------------------------------------------------------------

alter table gm_sessions
  add column if not exists age_record jsonb;

comment on column gm_sessions.age_record is
  'Bracket, birth year, attestation time, and any guardian consent. Birth year only: the year is enough to apply the rule and a full date of birth is more identifying than we need.';

-- Finding accounts whose guardian has not yet responded, so a stalled request
-- can be chased or expired rather than sitting open forever.
create index if not exists gm_sessions_guardian_pending_idx
  on gm_sessions ((age_record -> 'guardian' ->> 'consented_at'))
  where age_record -> 'guardian' is not null;
