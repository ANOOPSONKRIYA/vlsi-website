-- Member portal additions: ownership + self-service profiles

alter table public.team_members
  add column if not exists "userId" uuid unique;

alter table public.projects
  add column if not exists "ownerId" uuid;

create index if not exists team_members_user_id_idx on public.team_members ("userId");
create index if not exists projects_owner_id_idx on public.projects ("ownerId");

-- Member helper
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm."userId" = auth.uid()
       or tm.email = (auth.jwt() ->> 'email')
  );
$$;

-- Projects: allow owners to read/write their own
create policy "Projects owner read"
on public.projects
for select
using ("ownerId" = auth.uid());

create policy "Projects member insert"
on public.projects
for insert
with check ("ownerId" = auth.uid());

create policy "Projects member update"
on public.projects
for update
using ("ownerId" = auth.uid())
with check ("ownerId" = auth.uid());

create policy "Projects member delete"
on public.projects
for delete
using ("ownerId" = auth.uid());

-- Team members: allow self-update
create policy "Team members self update"
on public.team_members
for update
using (
  public.is_admin()
  or "userId" = auth.uid()
  or ("userId" is null and email = (auth.jwt() ->> 'email'))
)
with check (
  public.is_admin()
  or "userId" = auth.uid()
  or ("userId" is null and email = (auth.jwt() ->> 'email'))
);

-- Storage policies for members
do $$
begin
  begin
    execute $pol$
      create policy "Media member insert"
      on storage.objects
      for insert
      with check (
        bucket_id = 'media'
        and (public.is_admin() or public.is_member())
      )
    $pol$;
  exception when duplicate_object then
    raise notice 'Policy "Media member insert" already exists.';
  when insufficient_privilege then
    raise notice 'Skipping policy "Media member insert" (insufficient privileges).';
  end;

  begin
    execute $pol$
      create policy "Media member update"
      on storage.objects
      for update
      using (
        bucket_id = 'media'
        and (public.is_admin() or public.is_member())
        and owner = auth.uid()
      )
      with check (
        bucket_id = 'media'
        and (public.is_admin() or public.is_member())
        and owner = auth.uid()
      )
    $pol$;
  exception when duplicate_object then
    raise notice 'Policy "Media member update" already exists.';
  when insufficient_privilege then
    raise notice 'Skipping policy "Media member update" (insufficient privileges).';
  end;

  begin
    execute $pol$
      create policy "Media member delete"
      on storage.objects
      for delete
      using (
        bucket_id = 'media'
        and (public.is_admin() or public.is_member())
        and owner = auth.uid()
      )
    $pol$;
  exception when duplicate_object then
    raise notice 'Policy "Media member delete" already exists.';
  when insufficient_privilege then
    raise notice 'Skipping policy "Media member delete" (insufficient privileges).';
  end;
end $$;
