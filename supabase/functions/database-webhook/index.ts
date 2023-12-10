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

function whoScored(record: FixtureRecord, oldRecord: FixtureRecord): string { 
  // Determine which team scored
  if (record.home_goals !== oldRecord.home_goals) {
    return 'home';
  } else if (record.away_goals !== oldRecord.away_goals) {
    return 'away';
  } else {
    return 'none'; // In case no team scored
  }
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

async function addPost(SupabaseClient: SupabaseClient, newInfo: string, club0: number, club1: number) {
  const { data, error } = await SupabaseClient
    .from("posts")
    .insert([
      {
        user_id: "c83cef52-7948-41be-b5af-d2bdef31e033",
        content: newInfo,
        image_url: "",
        created_at: new Date(),
        original_post_id: null,
        is_official: true,
        club0: club0,
        club1: club1,
      },
    ]);
  if (error) throw error;
  console.log("Inserted", data);
}

// async function getClubInformation(
//   supabaseClient: SupabaseClient,
//   clubIDHome: number,
//   clubIDAway: number,
// ) {
//   const { data, error } = await supabaseClient
//     .from("clubs")
//     .select("name")
//     .in("id", [clubIDHome, clubIDAway]);

//   if (error) {
//     throw error;
//   }

//   // Assuming the data array contains the rows in the same order as the IDs were provided
//   console.log("Fetched", data);
//   return { homeTeam: data[0]?.name, awayTeam: data[1]?.name };
// }


async function getClubName(supabaseClient: SupabaseClient, clubID: number) {
  const { data, error } = await supabaseClient
    .from("clubs")
    .select("name")
    .eq("id", clubID);

  if (error) {
    throw error;
  }

  return data[0]?.name;
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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );

  //GET id of home and away team
  // const { homeTeam, awayTeam } = await getClubInformation(
  //   supabaseClient,
  //   payload.record.team0,
  //   payload.record.team1,
  // );

  const homeTeam = await getClubName(supabaseClient, payload.record.team0);
  const awayTeam = await getClubName(supabaseClient, payload.record.team1);

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
    const whoScoredResult = whoScored(payload.record, payload.old_record!);

    let scoringTeam = "";

    if (whoScoredResult === 'home') {
      scoringTeam = homeTeam;
    } else if (whoScoredResult === 'away') {
      scoringTeam = awayTeam;
    }

    const message = scoringTeam ? `${scoringTeam} just scored!` : "";
    console.log("message: ",message);
    console.log("payload.record.team0: ",payload.record.team0);
    console.log("payload.record.team1: ",payload.record.team1);

    if (message) {
      addPost(
        supabaseClient,
        `${score} - ${message}`,
        payload.record.team0,
        payload.record.team1,
      );
    }
  } else {
    console.log("No goal scored");
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
