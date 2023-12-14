interface ApiOdds {
  league: League;
  fixture: Fixture;
  update: string;
  bookmakers: Bookmaker[];
}

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

interface Fixture {
  id: number;
  timezone: string;
  date: string;
  timestamp: number;
}

interface Bookmaker {
  id: number;
  name: string;
  bets: Bet[];
}

interface Bet {
  id: number;
  name: string;
  values: BetValue[];
}

interface BetValue {
  value: string;
  odd: string;
}

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a",
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
  },
};

interface SupabaseOdds {
  odds_home: number;
  odds_away: number;
  odds_draw: number;
}

function convertApiOddsToSupabaseOdds(apiOdds: ApiOdds): SupabaseOdds {
  const firstBetValues = apiOdds.bookmakers[0]?.bets[0]?.values;
  if (!firstBetValues || firstBetValues.length < 3) {
    throw new Error("Invalid bet values");
  }

  // Convert string odds to numbers and return the SupabaseOdds structure
  return {
    odds_home: parseFloat(firstBetValues[0].odd),
    odds_draw: parseFloat(firstBetValues[1].odd),
    odds_away: parseFloat(firstBetValues[2].odd),
  };
}

async function getTodayBets(): Promise<ApiOdds[]> {
  const today = new Date();
  const date = today.toISOString().split("T")[0];
  const url =
    `https://api-football-v1.p.rapidapi.com/v3/odds?league=144&season=2023&date=${date}&bookmaker=16`;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
}

async function getBetsForNextFiveDays(): Promise<ApiOdds[]> {
  let allBets: ApiOdds[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split("T")[0];
    const url =
      `https://api-football-v1.p.rapidapi.com/v3/odds?league=144&season=2023&date=${dateString}&bookmaker=16`;

    try {
      console.log(`Fetching bets for ${dateString}`);
      const response = await fetch(url, options);
      const data = await response.json();
      allBets = allBets.concat(data.response);
    } catch (error) {
      console.error(`Error fetching bets for ${dateString}:`, error);
    }
  }
  return allBets;
}

async function addBets(supabaseClient: SupabaseClient, bets: ApiOdds[]) {
  for (const bet of bets) {
    const odds = convertApiOddsToSupabaseOdds(bet);
    const { data, error } = await supabaseClient
      .from("fixtures")
      .update([{
        odds_home: odds.odds_home,
        odds_away: odds.odds_away,
        odds_draw: odds.odds_draw,
      }])
      .eq("fixtureID", bet.fixture.id);

    if (error) {
      console.error("Error inserting bet:", error);
    } else {
      console.log("Inserted bet:", data);
    }
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

  if (method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  console.log("Starting to fetch and update bets for the next 5 days");
  const bets = await getBetsForNextFiveDays();
  await addBets(supabaseClient, bets);
  console.log("Finished updating bets");

  return new Response();
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/betupdater' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
