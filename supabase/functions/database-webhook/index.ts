// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";

type FixtureRecord = {
  away_goals: number | null;
  final_score: string | null;
  fixtureID: number;
  home_goals: number | null;
  is_finished: boolean | null;
  lineup: string | null;
  odds_away: number | null;
  odds_draw: number | null;
  odds_home: number | null;
  referee: string | null;
  team0: number;
  team1: number;
  time: string;
  venue: string | null;
  winner: boolean | null;
};
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: FixtureRecord;
  schema: "public";
  old_record: null | FixtureRecord;
}

function whoScored(record: FixtureRecord, oldRecord: FixtureRecord): boolean { //0 for home team, 1 for away team
  return (
    record.home_goals !== oldRecord.home_goals
  );
}

function isGoalScored(
  record: FixtureRecord,
  oldRecord: FixtureRecord,
): boolean {
  return (
    record.home_goals !== oldRecord.home_goals ||
    record.away_goals !== oldRecord.away_goals
  );
}

async function addPost(SupabaseClient: SupabaseClient, newInfo: string, image_url?: string) {
  const { data, error } = await SupabaseClient
    .from("posts")
    .upsert([
      {
        user_id: "c83cef52-7948-41be-b5af-d2bdef31e033",
        image_url: image_url,
        content: newInfo,
        created_at: new Date(),
        original_post_id: null,
        is_official: true,
      },
    ]);
  if (error) throw error;
  console.log("Inserted", data);
}

async function getClubInformation(
  supabaseClient: SupabaseClient,
  clubIDHome: number,
  clubIDAway: number,
) {
  const { data, error } = await supabaseClient
    .from("clubs")
    .select("name")
    .in("id", [clubIDHome, clubIDAway]);

  if (error) {
    throw error;
  }

  // Assuming the data array contains the rows in the same order as the IDs were provided
  console.log("Fetched", data);
  return { homeTeam: data[0]?.name, awayTeam: data[1]?.name };
}

async function getClubPictures(
  supabaseClient: SupabaseClient,
  clubIDHome: number,
  clubIDAway: number,
) {
  const { data, error } = await supabaseClient
    .from("clubs")
    .select("logo")
    .in("id", [clubIDHome, clubIDAway]);

  if (error) {
    throw error;
  }

  // Assuming the data array contains the rows in the same order as the IDs were provided
  console.log("Fetched", data);
  return { homeTeamPicture: data[0]?.logo, awayTeamPicture: data[1]?.logo };
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );

  const { homeTeam, awayTeam } = await getClubInformation(
    supabaseClient,
    payload.record.team0,
    payload.record.team1,
  );
  const { homeTeamPicture, awayTeamPicture } = await getClubPictures(
    supabaseClient,
    payload.record.team0,
    payload.record.team1,
  );
  // if (isGoalScored(payload.record, payload.old_record!)) {
  //   const score =
  //     `${payload.record.home_goals}  - ${payload.record.away_goals}`;
  //   const message = whoScored(payload.record, payload.old_record!)
  //     ? awayTeam.concat(" scored!")
  //     : homeTeam.concat(" scored!");
  //   addPost(
  //     supabaseClient,
  //     score.concat(" ", message),
  //   );
  // }
  if (isGoalScored(payload.record, payload.old_record!)) {
    const score = `${homeTeam} ${payload.record.home_goals} - ${payload.record.away_goals} ${awayTeam}`;
    const scoringTeam = whoScored(payload.record, payload.old_record!) ? awayTeam : homeTeam;
    const message = `${scoringTeam} just scored!`;


    const sentImage = whoScored(payload.record, payload.old_record!) ? awayTeamPicture : homeTeamPicture;

    addPost(
      supabaseClient,
      `${score} - ${message}`,
      sentImage,
    );
}


  const data = {
    message: "Request processed successfully",
    homeTeam: homeTeam,
    awayTeam: awayTeam,
  };
  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/database-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
