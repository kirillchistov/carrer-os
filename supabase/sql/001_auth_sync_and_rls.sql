-- Career Evidence OS — identity bridge + defense-in-depth RLS.
--
-- This Supabase project also hosts another, unrelated app in the "public" schema.
-- Career Evidence OS's own tables live entirely in the "career_os" schema (see
-- prisma/schema.prisma's datasource block) so the two never collide. Supabase Auth
-- itself (auth.users) is shared between both apps — a signup on either app creates
-- one auth.users row, and this trigger mirrors it into career_os.users regardless of
-- which app the person actually signed up through. If the other app has its own
-- trigger on auth.users, that's fine: Postgres runs every AFTER INSERT trigger on a
-- table, they don't interfere with each other.
--
-- Run this AFTER the Prisma migration that creates the tables (`pnpm prisma migrate deploy`
-- or `pnpm prisma migrate dev`), via the Supabase SQL editor or `supabase db execute`.
--
-- IMPORTANT: the app's actual authorization boundary is server-side ownership checks
-- (see src/lib/db/with-ownership.ts) — Prisma connects with a privileged role via the
-- connection pooler and does not carry the end user's JWT, so these RLS policies are
-- NOT evaluated for the app's own queries. They exist so that a leaked service key, a
-- misconfigured pooler, or a future direct `supabase-js` code path fails closed instead
-- of open. Keep both layers in sync when adding a new user-owned table.

-- ---------- Identity bridge ----------
-- Mirrors every new Supabase auth user into career_os.users so Prisma can model User as
-- a normal foreign-key target without owning the `auth` schema itself. Also opens a
-- CreditAccount with a starting balance so the AI features work immediately — this is a
-- free-trial allotment, not "unlimited AI access" (see docs/product-plan.md, "Credits").
create or replace function career_os.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = career_os
as $$
begin
  insert into career_os.users (id, email, "displayName", locale, "createdAt", "updatedAt")
  values (new.id, new.email, null, 'ru', now(), now())
  on conflict (id) do nothing;

  insert into career_os.credit_accounts (id, "userId", balance, "updatedAt")
  values (gen_random_uuid()::text, new.id, 20, now())
  on conflict ("userId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_career_os on auth.users;
create trigger on_auth_user_created_career_os
  after insert on auth.users
  for each row execute function career_os.handle_new_auth_user();

-- Without this, deleting an auth.users row (e.g. account deletion) leaves an orphaned
-- career_os.users row and everything under it behind.
alter table career_os.users drop constraint if exists users_auth_users_fkey;
alter table career_os.users
  add constraint users_auth_users_fkey foreign key (id) references auth.users(id) on delete cascade;

-- ---------- Row Level Security ----------

alter table career_os.users enable row level security;
drop policy if exists "users_self" on career_os.users;
create policy "users_self" on career_os.users
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Tables with a direct "userId" column: owner-only access.
do $$
declare
  t text;
  owned_tables text[] := array[
    'candidate_profiles', 'career_tracks', 'experiences', 'evidence', 'skills',
    'resumes', 'resume_versions', 'opportunities', 'fit_assessments', 'applications',
    'contacts', 'interviews', 'tasks', 'documents', 'ai_runs', 'ai_feedback_reports',
    'credit_accounts', 'credit_transactions'
  ];
begin
  foreach t in array owned_tables loop
    execute format('alter table career_os.%I enable row level security;', t);
    execute format('drop policy if exists "%s_owner" on career_os.%I;', t, t);
    execute format(
      'create policy "%s_owner" on career_os.%I for all using ("userId" = auth.uid()) with check ("userId" = auth.uid());',
      t, t
    );
  end loop;
end $$;

-- Child tables without their own "userId": scope through the parent.
alter table career_os.resume_change_proposals enable row level security;
drop policy if exists "resume_change_proposals_owner" on career_os.resume_change_proposals;
create policy "resume_change_proposals_owner" on career_os.resume_change_proposals
  for all using (
    exists (
      select 1 from career_os.resume_versions rv
      where rv.id = "resumeVersionId" and rv."userId" = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from career_os.resume_versions rv
      where rv.id = "resumeVersionId" and rv."userId" = auth.uid()
    )
  );

alter table career_os.opportunity_requirements enable row level security;
drop policy if exists "opportunity_requirements_owner" on career_os.opportunity_requirements;
create policy "opportunity_requirements_owner" on career_os.opportunity_requirements
  for all using (
    exists (
      select 1 from career_os.opportunities o
      where o.id = "opportunityId" and o."userId" = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from career_os.opportunities o
      where o.id = "opportunityId" and o."userId" = auth.uid()
    )
  );
