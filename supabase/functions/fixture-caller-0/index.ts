// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";
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

// console.log("Hello from Functions!");

async function getFixtures(): Promise<SimpleFixture[]>  {
  const url =
    "https://api-football-v1.p.rapidapi.com/v3/fixtures?date=2023-12-09&league=144&season=2023";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
  };


  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const simpleFixtures: SimpleFixture[] = data.response.map((fixture: Fixture) => {
      return {
        fixtureID: fixture.fixture.id,
        team0: fixture.teams.home.id,
        team1: fixture.teams.away.id,
        time: fixture.fixture.date,
        referee: fixture.fixture.referee
      };
    });

    return simpleFixtures;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return [];
  }

}


Deno.serve(async (req) => {
    try {
      const data = await getFixtures();
      return new Response(JSON.stringify(data), {status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(error.message, { status: 500 });
    }
  });

// Deno.serve(async (req) => {
//   const { name } = await req.json();
//   const data = {
//     message: `Hello ${name}!`,
//   };

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   );
// });

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fixture-caller-0' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
