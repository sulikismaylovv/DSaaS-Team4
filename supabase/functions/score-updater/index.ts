// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
export interface Fixture {
  fixture: fixtureInfo;
  league: league;
  teams: Teams;
  goals: Goals;
  score: Score;
}

export interface fixtureInfo {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
}

export interface league {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
}

export interface home {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
}

export interface away {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
}

export interface Teams {
  home: home;
  away: away;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

interface SimpleFixture {
  fixtureID: number;
  team0: number;
  team1: number;
  time: string;
  referee?: string;
}
import f from "https://cdn.jsdelivr.net/npm/@supabase/node-fetch@2.6.14/+esm";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";

async function getTodayFixtures(): Promise<Fixture[]> {
  const today = new Date();
  const date = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const url =
    `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}&league=144&season=2023`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data.response; // Assuming that the fixtures are in the 'response' field of the JSON
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
}

async function updateScore(supabaseClient: SupabaseClient, fixture: Fixture) {
  const isFinished = fixture.score.fulltime.home !== null &&
    fixture.score.fulltime.away !== null;
  const scoreUpdate = {
    home_goals: fixture.goals.home,
    away_goals: fixture.goals.away,
    is_finished: isFinished,
  };
  const { data, error } = await supabaseClient
    .from("fixtures")
    .update(scoreUpdate)
    .eq("fixtureID", fixture.fixture.id);
  if (error) throw error;

  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
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

  if (method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const fixtures = await getTodayFixtures();
  for (const fixture of fixtures) {
    await updateScore(supabaseClient, fixture);
  }

  return new Response();
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/score-updater' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
