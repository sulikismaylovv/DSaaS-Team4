alter table "public"."friendships" drop constraint "friendships_user1_id_fkey";

alter table "public"."friendships" drop constraint "friendships_user2_id_fkey";

alter table "public"."friendships" add constraint "friendships_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."friendships" validate constraint "friendships_user1_id_fkey";

alter table "public"."friendships" add constraint "friendships_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."friendships" validate constraint "friendships_user2_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.call_supabase_function()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    response json;
BEGIN
    BEGIN
        SELECT net.http_post(
            'https://exspobkugyipwqkqoavo.supabase.co/functions/v1/fixture-caller',
            '{"name":"Functions"}',  -- Your payload here
            'application/json',      -- Content type
            ''                       -- Headers, add your authorization if needed
        ) INTO response;
    EXCEPTION WHEN OTHERS THEN
        -- In case of error, return the error message
        RETURN json_build_object('error', SQLERRM);
    END;

    RETURN response;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_avatar(avatar_url text, OUT status integer, OUT content text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  select
      into status, content
           result.status, result.content
      from public.delete_storage_object('avatars', avatar_url) as result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_old_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  -- Your deletion logic here
  DELETE FROM users WHERE id = OLD.id;
  RETURN OLD;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_storage_object(bucket text, object text, OUT status integer, OUT content text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  project_url text := '<YOURPROJECTURL>';
  service_role_key text := '<YOURSERVICEROLEKEY>'; --  full access needed
  url text := project_url||'/storage/v1/object/'||bucket||'/'||object;
begin
  select
      into status, content
           result.status::int, result.content::text
      FROM extensions.http((
    'DELETE',
    url,
    ARRAY[extensions.http_header('authorization','Bearer '||service_role_key)],
    NULL,
    NULL)::extensions.http_request) as result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_player(excluded_players integer[], fav_team_id integer DEFAULT NULL::integer, is_fav_team boolean DEFAULT false)
 RETURNS SETOF players
 LANGUAGE plpgsql
AS $function$
DECLARE
  result players%ROWTYPE;
BEGIN
  IF is_fav_team THEN
    -- Fetch a random player from the favorite team
    SELECT p.* INTO result
    FROM randomplayers rp
    JOIN players p ON rp.player_id = p.id
    WHERE NOT (p.id = ANY(excluded_players)) AND rp.club_id = fav_team_id
    ORDER BY random()
    LIMIT 1;
    RETURN NEXT result;
  ELSE
    -- Fetch three different random players
    FOR i IN 1..3 LOOP
      SELECT p.* INTO result
      FROM randomplayers rp
      JOIN players p ON rp.player_id = p.id
      WHERE NOT (p.id = ANY(excluded_players)) AND rp.club_id != fav_team_id
      ORDER BY random()
      LIMIT 1;

      RETURN NEXT result;
      -- Add the fetched player's ID to the excluded list to avoid duplicates
      excluded_players := array_append(excluded_players, result.id);
    END LOOP;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Ensure that the email is present
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  ELSE
    -- Handle the case where email is null. Perhaps log or notify.
    RAISE EXCEPTION 'Email cannot be null for user %', NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_auth_users_to_public()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Copy only id and email from auth.users to public.users
  -- Other fields in public.users will be set to their default values, which are NULL
  INSERT INTO public.users (id, email)
  SELECT id, email FROM auth.users
  ON CONFLICT (id) DO NOTHING; -- Skip if the user already exists in public.users
END;
$function$
;

CREATE OR REPLACE FUNCTION public.populate_random_players()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    club_record RECORD;
    random_player RECORD;
BEGIN
    -- Loop through each club
    FOR club_record IN SELECT id FROM clubs LOOP

        -- Get a random player from the current club
        SELECT * INTO random_player
        FROM players
        WHERE club = club_record.id
        ORDER BY RANDOM()
        LIMIT 1;

        -- If a player is found, update the corresponding row in randomplayers
        IF FOUND THEN
            UPDATE randomplayers
            SET player_id = random_player.id
            WHERE club_id = club_record.id;
        ELSE
            -- If no player is found, you can choose to do nothing or handle the case as needed
            -- For example, you could set the player_id to NULL or a default value
            UPDATE randomplayers
            SET player_id = NULL
            WHERE club_id = club_record.id;
        END IF;
    END LOOP;
    RETURN 'All clubs updated successfully.';
EXCEPTION WHEN OTHERS THEN
    -- Return the error message if something goes wrong
    RETURN 'Error: ' || SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_random_seed()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  SELECT setseed(0); -- or some other default value
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_random_seed(seed_value double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  SELECT setseed(seed_value);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.signup_copy_to_users_table()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    INSERT INTO public.users (id, email)
    VALUES(new.id, new.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_usersinfriendsleague_xp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.usersinfriendsleague AS ufl
    SET xp = NEW.xp
    FROM public.usersinbetting AS uib
    WHERE uib."userID" = ufl.userid;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_xp_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.usersinfriendsleague AS uib
    SET xp = ufl.xp
    FROM public.usersinbetting AS ufl
    WHERE uib.userid = ufl."userID";

    RETURN NEW; -- Return the new row
END;
$function$
;


