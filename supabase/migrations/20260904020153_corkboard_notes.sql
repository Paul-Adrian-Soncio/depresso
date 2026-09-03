-- The corkboard guestbook: short public notes, posted with no login. RLS
-- enabled per CLAUDE.md's architecture rule (defence in depth), but no
-- public write policy — every insert goes through a Server Action using
-- the service-role client, same pattern as orders/checkout, so rate
-- limiting and validation live in one place server-side rather than being
-- something client code could bypass.

create table corkboard_notes (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Anonymous',
  message text not null check (char_length(message) between 1 and 280),
  poster_ip text, -- for rate limiting only; never displayed
  created_at timestamptz not null default now()
);

comment on table corkboard_notes is 'Public guestbook notes. poster_ip is used only to rate-limit posting (see submit_corkboard_note), never shown to any visitor or admin UI.';

create index corkboard_notes_created_at_idx on corkboard_notes (created_at desc);
create index corkboard_notes_poster_ip_idx on corkboard_notes (poster_ip, created_at);

alter table corkboard_notes enable row level security;

create policy "corkboard notes are publicly readable"
  on corkboard_notes for select
  using (true);

-- No public insert/update/delete policy: posting goes through the
-- submitCorkboardNote server action (service role), moderation/removal
-- through the admin-only deleteCorkboardNote action.

comment on column corkboard_notes.poster_ip is 'Populated from the request''s forwarded-for header at post time. Rate limiting checks the most recent row for a given IP; this column is never selected for display anywhere.';
