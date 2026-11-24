begin;

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table public.profiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint profiles_display_name_valid check (
        char_length(display_name) between 1 and 80
        and display_name = btrim(display_name)
        and display_name !~ '[[:cntrl:]]'
        and position(chr(8232) in display_name) = 0
        and position(chr(8233) in display_name) = 0
    )
);

create function public.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.touch_profile_updated_at();

revoke all on function public.touch_profile_updated_at() from public, anon, authenticated;

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (user_id, display_name), update (user_id, display_name)
    on table public.profiles to authenticated;

create policy profiles_select_own on public.profiles
    for select to authenticated
    using (user_id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
    for insert to authenticated
    with check (user_id = (select auth.uid()));

create policy profiles_update_own on public.profiles
    for update to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

commit;
