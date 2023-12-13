
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."Status of the Frkendship" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'blocked'
);

ALTER TYPE "public"."Status of the Frkendship" OWNER TO "postgres";


ALTER FUNCTION "public"."call_supabase_function"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_avatar"("avatar_url" "text", OUT "status" integer, OUT "content" "text") RETURNS "record"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  select
      into status, content
           result.status, result.content
      from public.delete_storage_object('avatars', avatar_url) as result;
end;
$$;

ALTER FUNCTION "public"."delete_avatar"("avatar_url" "text", OUT "status" integer, OUT "content" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_old_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  -- Your deletion logic here
  DELETE FROM users WHERE id = OLD.id;
  RETURN OLD;
end;
$$;

ALTER FUNCTION "public"."delete_old_profile"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_storage_object"("bucket" "text", "object" "text", OUT "status" integer, OUT "content" "text") RETURNS "record"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."delete_storage_object"("bucket" "text", "object" "text", OUT "status" integer, OUT "content" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" bigint NOT NULL,
    "name" character varying NOT NULL,
    "club" bigint,
    "age" bigint,
    "number" bigint,
    "position" character varying,
    "photo" character varying
);

ALTER TABLE "public"."players" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_random_player"("excluded_players" integer[], "fav_team_id" integer DEFAULT NULL::integer, "is_fav_team" boolean DEFAULT false) RETURNS SETOF "public"."players"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."get_random_player"("excluded_players" integer[], "fav_team_id" integer, "is_fav_team" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_auth_users_to_public"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Copy only id and email from auth.users to public.users
  -- Other fields in public.users will be set to their default values, which are NULL
  INSERT INTO public.users (id, email)
  SELECT id, email FROM auth.users
  ON CONFLICT (id) DO NOTHING; -- Skip if the user already exists in public.users
END;
$$;

ALTER FUNCTION "public"."insert_auth_users_to_public"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."populate_random_players"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."populate_random_players"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reset_random_seed"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  SELECT setseed(0); -- or some other default value
END;
$$;

ALTER FUNCTION "public"."reset_random_seed"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_random_seed"("seed_value" double precision) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  SELECT setseed(seed_value);
END;
$$;

ALTER FUNCTION "public"."set_random_seed"("seed_value" double precision) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."signup_copy_to_users_table"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  BEGIN
    INSERT INTO public.users (id, email)
    VALUES(new.id, new.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
$$;

ALTER FUNCTION "public"."signup_copy_to_users_table"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."bettingrecord" (
    "id" bigint NOT NULL,
    "time_placed" timestamp with time zone NOT NULL,
    "team_chosen" "text" NOT NULL,
    "credits" bigint NOT NULL,
    "outcome" boolean,
    "time_settled" timestamp with time zone,
    "betterID" bigint NOT NULL,
    "fixtureID" bigint NOT NULL,
    "is_settled" boolean DEFAULT false
);

ALTER TABLE "public"."bettingrecord" OWNER TO "postgres";

ALTER TABLE "public"."bettingrecord" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bettingrecord_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."clubs" (
    "id" bigint NOT NULL,
    "name" character varying NOT NULL,
    "code" character varying,
    "country" character varying,
    "founded" bigint,
    "national" boolean,
    "logo" character varying,
    "leagueID" bigint,
    "goal_difference" bigint DEFAULT '1'::bigint,
    "points" bigint DEFAULT '1'::bigint
);

ALTER TABLE "public"."clubs" OWNER TO "postgres";

ALTER TABLE "public"."clubs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."clubs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" integer NOT NULL,
    "post_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."comments_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."comments_id_seq" OWNED BY "public"."comments"."id";

CREATE TABLE IF NOT EXISTS "public"."fixtures" (
    "fixtureID" bigint NOT NULL,
    "team0" bigint NOT NULL,
    "team1" bigint NOT NULL,
    "time" timestamp with time zone NOT NULL,
    "referee" character varying,
    "venue" character varying,
    "is_finished" boolean,
    "winner" boolean,
    "home_goals" bigint,
    "away_goals" bigint,
    "final_score" character varying,
    "lineup" character varying,
    "odds_home" real,
    "odds_away" real,
    "odds_draw" real
);

ALTER TABLE "public"."fixtures" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "friendships_check" CHECK (("user1_id" <> "user2_id")),
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text", 'blocked'::"text"])))
);

ALTER TABLE "public"."friendships" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."friendsleagues" (
    "id" bigint NOT NULL,
    "name" character varying DEFAULT ''::character varying NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone
);

ALTER TABLE "public"."friendsleagues" OWNER TO "postgres";

ALTER TABLE "public"."friendsleagues" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."friendsleagues_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."likes" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."likes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."likes_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."likes_id_seq" OWNED BY "public"."likes"."id";

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "title" "text"
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";

ALTER TABLE "public"."players" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."players_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "original_post_id" integer,
    "is_official" boolean DEFAULT false NOT NULL,
    "club0" bigint,
    "club1" bigint
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."posts_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."posts_id_seq" OWNED BY "public"."posts"."id";

CREATE TABLE IF NOT EXISTS "public"."preferences" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "club_id" bigint NOT NULL,
    "favorite_club" boolean DEFAULT false NOT NULL,
    "followed_club" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."preferences" OWNER TO "postgres";

ALTER TABLE "public"."preferences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."preferences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."randomplayers" (
    "id" bigint NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "club_id" bigint,
    "player_id" bigint
);

ALTER TABLE "public"."randomplayers" OWNER TO "postgres";

ALTER TABLE "public"."randomplayers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."randomplayers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."result" (
    "id" bigint,
    "name" character varying,
    "club" bigint,
    "age" bigint,
    "number" bigint,
    "position" character varying,
    "photo" character varying
);

ALTER TABLE "public"."result" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_player_purchases" (
    "id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "player_id" bigint
);

ALTER TABLE "public"."user_player_purchases" OWNER TO "postgres";

ALTER TABLE "public"."user_player_purchases" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_player_purchases_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "updated_at" timestamp with time zone,
    "birthdate" "date",
    "password" "text",
    "first_name" "text",
    "last_name" "text",
    "username" character varying(255),
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "bg_url" "text",
    "is_recently_logged" boolean DEFAULT false,
    CONSTRAINT "password_format" CHECK (("password" ~* '^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$'::"text")),
    CONSTRAINT "password_length" CHECK ((("char_length"("password") >= 8) AND ("char_length"("password") <= 128))),
    CONSTRAINT "password_no_repeats" CHECK (("password" !~* '^(.)\1+$'::"text")),
    CONSTRAINT "password_no_spaces" CHECK (("password" = TRIM(BOTH FROM "password"))),
    CONSTRAINT "password_not_common" CHECK (("password" <> ALL (ARRAY['password123'::"text", '12345678'::"text"])))
);

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."usersinbetting" (
    "betterID" bigint NOT NULL,
    "credits" bigint,
    "activeCredits" bigint,
    "userID" "uuid" NOT NULL,
    "xp" bigint DEFAULT '0'::bigint
);

ALTER TABLE "public"."usersinbetting" OWNER TO "postgres";

ALTER TABLE "public"."usersinbetting" ALTER COLUMN "betterID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."usersinbetting_betterID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."usersinfriendsleague" (
    "id" bigint NOT NULL,
    "userid" "uuid" NOT NULL,
    "leagueid" bigint NOT NULL,
    "xp" bigint
);

ALTER TABLE "public"."usersinfriendsleague" OWNER TO "postgres";

ALTER TABLE "public"."usersinfriendsleague" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."usersinfriendsleague_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comments_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."likes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."likes_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."posts_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."bettingrecord"
    ADD CONSTRAINT "bettingrecord_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "fixtures_pkey" PRIMARY KEY ("fixtureID");

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("user1_id", "user2_id");

ALTER TABLE ONLY "public"."friendsleagues"
    ADD CONSTRAINT "friendsleagues_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."randomplayers"
    ADD CONSTRAINT "randomplayers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_player_purchases"
    ADD CONSTRAINT "user_player_purchases_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."usersinbetting"
    ADD CONSTRAINT "usersinbetting_pkey" PRIMARY KEY ("betterID");

ALTER TABLE ONLY "public"."usersinbetting"
    ADD CONSTRAINT "usersinbetting_userID_key" UNIQUE ("userID");

ALTER TABLE ONLY "public"."usersinfriendsleague"
    ADD CONSTRAINT "usersinfriendsleague_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "bet-updater" AFTER UPDATE ON "public"."fixtures" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://kvjhoifmabxitkelfeod.supabase.co/functions/v1/bets-webhook', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ"}', '{}', '1000');

CREATE OR REPLACE TRIGGER "betting-notification-webhook" AFTER UPDATE ON "public"."bettingrecord" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://kvjhoifmabxitkelfeod.supabase.co/functions/v1/bet-notification-webhook', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ"}', '{}', '1000');

CREATE OR REPLACE TRIGGER "post-creator" AFTER UPDATE ON "public"."fixtures" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://kvjhoifmabxitkelfeod.supabase.co/functions/v1/database-webhook', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ"}', '{}', '1000');

ALTER TABLE ONLY "public"."bettingrecord"
    ADD CONSTRAINT "bettingrecord_betterID_fkey" FOREIGN KEY ("betterID") REFERENCES "public"."usersinbetting"("betterID") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bettingrecord"
    ADD CONSTRAINT "bettingrecord_fixtureID_fkey" FOREIGN KEY ("fixtureID") REFERENCES "public"."fixtures"("fixtureID") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "fixtures_team0_fkey" FOREIGN KEY ("team0") REFERENCES "public"."clubs"("id");

ALTER TABLE ONLY "public"."fixtures"
    ADD CONSTRAINT "fixtures_team1_fkey" FOREIGN KEY ("team1") REFERENCES "public"."clubs"("id");

ALTER TABLE ONLY "public"."randomplayers"
    ADD CONSTRAINT "fk_club_id" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id");

ALTER TABLE ONLY "public"."user_player_purchases"
    ADD CONSTRAINT "fk_player" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."randomplayers"
    ADD CONSTRAINT "fk_player_id" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id");

ALTER TABLE ONLY "public"."user_player_purchases"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."friendsleagues"
    ADD CONSTRAINT "friendsleagues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_club_fkey" FOREIGN KEY ("club") REFERENCES "public"."clubs"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_club0_fkey" FOREIGN KEY ("club0") REFERENCES "public"."clubs"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_club1_fkey" FOREIGN KEY ("club1") REFERENCES "public"."clubs"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_original_post_id_fkey" FOREIGN KEY ("original_post_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."usersinbetting"
    ADD CONSTRAINT "usersinbetting_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."usersinfriendsleague"
    ADD CONSTRAINT "usersinfriendsleague_leagueid_fkey" FOREIGN KEY ("leagueid") REFERENCES "public"."friendsleagues"("id");

ALTER TABLE ONLY "public"."usersinfriendsleague"
    ADD CONSTRAINT "usersinfriendsleague_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."users"("id");

CREATE POLICY "Comments are viewable by everyone." ON "public"."comments" FOR SELECT USING (true);

CREATE POLICY "Enable access for all users" ON "public"."friendships" USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."bettingrecord" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_player_purchases" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."usersinbetting" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."usersinfriendsleague" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."bettingrecord" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."clubs" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."friendships" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."friendsleagues" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."notifications" USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."players" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."preferences" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."randomplayers" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_player_purchases" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."usersinbetting" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."usersinfriendsleague" FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."usersinbetting" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Likes are viewable by everyone." ON "public"."likes" FOR SELECT USING (true);

CREATE POLICY "Posts are viewable by everyone." ON "public"."posts" FOR SELECT USING (true);

CREATE POLICY "Profiles are viewable, editable, deletable by users who created" ON "public"."users" USING (("auth"."uid"() = "id"));

CREATE POLICY "Public users are viewable by everyone." ON "public"."users" FOR SELECT USING (true);

CREATE POLICY "User Can Delete Own Leagues" ON "public"."friendsleagues" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Delete Own Preferences" ON "public"."preferences" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Insert Own Leagues" ON "public"."friendsleagues" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Insert Own Preferences" ON "public"."preferences" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Select Own Leagues" ON "public"."friendsleagues" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Select Own Preferences" ON "public"."preferences" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Update Own Leagues" ON "public"."friendsleagues" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User Can Update Own Preferences" ON "public"."preferences" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "User can only have 1 favorite team" ON "public"."preferences" FOR INSERT WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM "public"."preferences" "preferences_1"
  WHERE (("preferences_1"."user_id" = "auth"."uid"()) AND ("preferences_1"."favorite_club" = true))))));

CREATE POLICY "Users can comment on any posts." ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own comments." ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own likes." ON "public"."likes" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own posts." ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own posts." ON "public"."posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own profile." ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can like any posts." ON "public"."likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update own profile." ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can update their own comments." ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own posts." ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."bettingrecord" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delete_friendships" ON "public"."friendships" FOR DELETE USING ((("user1_id" = "auth"."uid"()) OR ("user2_id" = "auth"."uid"())));

ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."friendsleagues" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_friendships" ON "public"."friendships" FOR INSERT WITH CHECK ((("user1_id" = "auth"."uid"()) AND ("user1_id" <> "user2_id")));

ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."preferences" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."randomplayers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update_friendships" ON "public"."friendships" FOR UPDATE USING ((("user2_id" = "auth"."uid"()) AND ("status" = 'pending'::"text"))) WITH CHECK (("user2_id" = "auth"."uid"()));

ALTER TABLE "public"."user_player_purchases" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."usersinbetting" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."usersinfriendsleague" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."call_supabase_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."call_supabase_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."call_supabase_function"() TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_avatar"("avatar_url" "text", OUT "status" integer, OUT "content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_avatar"("avatar_url" "text", OUT "status" integer, OUT "content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_avatar"("avatar_url" "text", OUT "status" integer, OUT "content" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_old_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_old_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_old_profile"() TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_storage_object"("bucket" "text", "object" "text", OUT "status" integer, OUT "content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_storage_object"("bucket" "text", "object" "text", OUT "status" integer, OUT "content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_storage_object"("bucket" "text", "object" "text", OUT "status" integer, OUT "content" "text") TO "service_role";

GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_random_player"("excluded_players" integer[], "fav_team_id" integer, "is_fav_team" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_player"("excluded_players" integer[], "fav_team_id" integer, "is_fav_team" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_player"("excluded_players" integer[], "fav_team_id" integer, "is_fav_team" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_auth_users_to_public"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_auth_users_to_public"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_auth_users_to_public"() TO "service_role";

GRANT ALL ON FUNCTION "public"."populate_random_players"() TO "anon";
GRANT ALL ON FUNCTION "public"."populate_random_players"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."populate_random_players"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_random_seed"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_random_seed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_random_seed"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_random_seed"("seed_value" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."set_random_seed"("seed_value" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_random_seed"("seed_value" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."signup_copy_to_users_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."signup_copy_to_users_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."signup_copy_to_users_table"() TO "service_role";

GRANT ALL ON TABLE "public"."bettingrecord" TO "anon";
GRANT ALL ON TABLE "public"."bettingrecord" TO "authenticated";
GRANT ALL ON TABLE "public"."bettingrecord" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bettingrecord_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bettingrecord_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bettingrecord_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."clubs" TO "anon";
GRANT ALL ON TABLE "public"."clubs" TO "authenticated";
GRANT ALL ON TABLE "public"."clubs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clubs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."fixtures" TO "anon";
GRANT ALL ON TABLE "public"."fixtures" TO "authenticated";
GRANT ALL ON TABLE "public"."fixtures" TO "service_role";

GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";

GRANT ALL ON TABLE "public"."friendsleagues" TO "anon";
GRANT ALL ON TABLE "public"."friendsleagues" TO "authenticated";
GRANT ALL ON TABLE "public"."friendsleagues" TO "service_role";

GRANT ALL ON SEQUENCE "public"."friendsleagues_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friendsleagues_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friendsleagues_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";

GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."players_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."preferences" TO "anon";
GRANT ALL ON TABLE "public"."preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."preferences" TO "service_role";

GRANT ALL ON SEQUENCE "public"."preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."preferences_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."randomplayers" TO "anon";
GRANT ALL ON TABLE "public"."randomplayers" TO "authenticated";
GRANT ALL ON TABLE "public"."randomplayers" TO "service_role";

GRANT ALL ON SEQUENCE "public"."randomplayers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."randomplayers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."randomplayers_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."result" TO "anon";
GRANT ALL ON TABLE "public"."result" TO "authenticated";
GRANT ALL ON TABLE "public"."result" TO "service_role";

GRANT ALL ON TABLE "public"."user_player_purchases" TO "anon";
GRANT ALL ON TABLE "public"."user_player_purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."user_player_purchases" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_player_purchases_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_player_purchases_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_player_purchases_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."usersinbetting" TO "anon";
GRANT ALL ON TABLE "public"."usersinbetting" TO "authenticated";
GRANT ALL ON TABLE "public"."usersinbetting" TO "service_role";

GRANT ALL ON SEQUENCE "public"."usersinbetting_betterID_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usersinbetting_betterID_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usersinbetting_betterID_seq" TO "service_role";

GRANT ALL ON TABLE "public"."usersinfriendsleague" TO "anon";
GRANT ALL ON TABLE "public"."usersinfriendsleague" TO "authenticated";
GRANT ALL ON TABLE "public"."usersinfriendsleague" TO "service_role";

GRANT ALL ON SEQUENCE "public"."usersinfriendsleague_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usersinfriendsleague_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usersinfriendsleague_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
