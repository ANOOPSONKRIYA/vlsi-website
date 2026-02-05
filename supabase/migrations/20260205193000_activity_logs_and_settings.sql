-- Activity logs, project access updates, and extended site settings

-- 1) Site settings: footer + contact details
alter table public.site_settings
  add column if not exists "footerDescription" text not null default '',
  add column if not exists "contactPhone" text not null default '',
  add column if not exists "contactAddress" text not null default '',
  add column if not exists "footerSocialLinks" jsonb not null default '[]'::jsonb;

-- 2) Activity logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  "actorId" uuid,
  "actorName" text,
  "actorEmail" text,
  "actorRole" text check ("actorRole" in ('admin', 'member')),
  action text not null,
  "entityType" text not null,
  "entityId" text,
  "entitySlug" text,
  "entityName" text,
  message text,
  details jsonb not null default '{}'::jsonb,
  "createdAt" timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs ("createdAt");
create index if not exists activity_logs_actor_name_idx on public.activity_logs ("actorName");
create index if not exists activity_logs_actor_email_idx on public.activity_logs ("actorEmail");
create index if not exists activity_logs_entity_type_idx on public.activity_logs ("entityType");
create index if not exists activity_logs_action_idx on public.activity_logs (action);

alter table public.activity_logs enable row level security;

create policy "Activity logs admin read"
on public.activity_logs
for select
using (public.is_admin());

create policy "Activity logs member/admin insert"
on public.activity_logs
for insert
with check (public.is_admin() or public.is_member());

-- 3) Project access: members can only access assigned projects
create or replace function public.is_project_member(project_team_members uuid[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.id = any(project_team_members)
      and (
        tm."userId" = auth.uid()
        or tm.email = (auth.jwt() ->> 'email')
      )
  );
$$;

-- Require at least one team member per project
alter table public.projects
  add constraint projects_team_members_required
  check (coalesce(array_length("teamMembers", 1), 0) > 0)
  not valid;

-- Replace member policies with assigned-member policies

drop policy if exists "Projects owner read" on public.projects;
drop policy if exists "Projects member insert" on public.projects;
drop policy if exists "Projects member update" on public.projects;
drop policy if exists "Projects member delete" on public.projects;

create policy "Projects member read assigned"
on public.projects
for select
using (public.is_project_member("teamMembers"));

create policy "Projects member insert assigned"
on public.projects
for insert
with check (public.is_project_member("teamMembers"));

create policy "Projects member update assigned"
on public.projects
for update
using (public.is_project_member("teamMembers"))
with check (public.is_project_member("teamMembers"));

create policy "Projects member delete assigned"
on public.projects
for delete
using (public.is_project_member("teamMembers"));
