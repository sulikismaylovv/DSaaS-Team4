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

interface bets{
  
}

async function updateScore(supabaseClient: SupabaseClient, fixture: Fixture) {
  const isFinished = fixture.score.fulltime.home !== null &&
    fixture.score.fulltime.away !== null;
  const scoreUpdate = {
    odds_home: fixture.goals.home,
    odds_away: fixture.goals.away,
    odds_draw: isFinished,
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
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/betupdater' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
