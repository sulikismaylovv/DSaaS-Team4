// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";


interface lineup {
  club: number;
  players: number[];
}

async function getTodayFixtures(
  supabaseClient: SupabaseClient,
): Promise<number[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  try {
    const { data, error } = await supabaseClient
      .from("fixtures")
      .select("fixtureID")
      .gte("time", todayStart.toISOString())
      .lte("time", todayEnd.toISOString());
    if (error) {
      throw error;
    }
    return data.map((fixture) => fixture.fixtureID);
  } catch {
    console.log("Error fetching fixtures:");
    return [];
  }
}

async function getTodayLineups(fixtureID: number): Promise<lineup[]> {
  const lineups: lineup[] = [];
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

    const url =
      `https://api-football-v1.p.rapidapi.com/v3/fixtures/lineups?fixture=${fixtureID}`;
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      for (const teamData of data.response) {
        const teamLineup: lineup = {
          club: teamData.team.id,
          players: teamData.startXI.map((
            playerData: { player: { id: number } },
          ) => playerData.player.id),
        };
        lineups.push(teamLineup);
      }
    } catch (error) {
      console.error("Error fetching lineup for fixture:", fixtureID, error);
    }
  

  return lineups;
}

async function updateLineups(
  supabaseClient: SupabaseClient,
  lineup: lineup[],
  fixtureID: number,
) {
    const { data, error } = await supabaseClient
      .from("fixtures")
      .update([{
        lineup: lineup[0].players.join(",").concat("|", lineup[1].players.join(",")),
      }])
      .eq("fixtureID", fixtureID);
    if (error) {
      console.error("Error inserting lineup:", error);
    } else {
      console.log("Inserted lineup:", data);
    }
}

Deno.serve(async (req) => {
  const { url, method } = req;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );
  
  const fixtureIDs = await getTodayFixtures(supabaseClient);
  for(const fixtureID of fixtureIDs){
    const lineups = await getTodayLineups(fixtureID);
    await updateLineups(supabaseClient, lineups, fixtureID);
  }
  return new Response();
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/lineup-updater' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
