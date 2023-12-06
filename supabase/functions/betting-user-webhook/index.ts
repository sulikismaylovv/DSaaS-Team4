// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface User {
  id: string;
  updated_at?: Date | string;
  birthdate?: Date | string;
  password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email: string;
  avatar_url?: string;
  bg_url?: string;
  is_recently_logged?: boolean;
}
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: User;
  schema: "public";
  old_record: null | User;
}

async function addUser(SupabaseClient: SupabaseClient, user:User) {
  const { data, error } = await SupabaseClient
    .from("usersinbetting")
    .upsert([
      {
        userID: user.id,
        credits: 1000,
        xp: 0
      },
    ]);
  if (error) {
    console.error(error);
  }
  console.log(data);
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

  if (payload.type === "INSERT") {
    await addUser(supabaseClient, payload.record);
  }

  return new Response();
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/betting-user-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
