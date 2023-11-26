// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

// import { serve } from "https://deno.land/std/http/server.ts";

export interface ApiFixture {
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
  home: number | null
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

interface SupabaseFixture {
  fixtureID: number;
  team0: number;
  team1: number;
  time: string;
  referee?: string;
  venue?: string;
  // ... other fields according to your database schema
}


import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase environment variables are not set.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {});

// Function to fetch all fixtures for a season
async function fetchSeasonFixtures() {
  const params = new URLSearchParams({
    league: '144',
    season: '2023'
  });

  const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?${params.toString()}`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a', // Set your RapidAPI Key in environment variable
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data: ' + response.status);
  }
  
  const data = await response.json();
  return data.response; // Assuming the API returns an object with a 'response' field
}


// Function to reformat each fixture to match your database schema
function formatFixtureData(apiFixture: ApiFixture): SupabaseFixture {
  // Implement your transformation logic here
  // Example transformation:
  return {
    fixtureID: apiFixture.fixture.id,
    team0: apiFixture.teams.home.id,
    team1: apiFixture.teams.away.id,
    time: apiFixture.fixture.date,
    referee: apiFixture.fixture.referee,
    // ... other fields according to your database schema
  };
}

// Function to upload data to Supabase
async function uploadDataToSupabase(data: SupabaseFixture[] ) {
  const { data: insertData, error } = await supabase
    .from('fixtures')
    .insert(data);

  if (error) {
    throw error;
  }

  return insertData;
}

// The main function to be exported and used as a Supabase Edge Function
export default async function () {
  try {
    // Set your league and season
    const league = '144';
    const season = '2023';

    const fixtures = await fetchSeasonFixtures();
    const insertData = await uploadDataToSupabase(fixtures);
    return new Response(JSON.stringify(insertData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fixture-caller' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
