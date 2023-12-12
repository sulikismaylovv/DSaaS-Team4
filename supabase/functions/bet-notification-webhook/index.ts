// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!");
import {createClient, SupabaseClient,} from "https://esm.sh/@supabase/supabase-js@2.7.1";

type bettingrecord = {
  betterID: number
  credits: number
  fixtureID: number
  id: number
  is_settled: boolean | null
  outcome: boolean | null
  team_chosen: string
  time_placed: string
  time_settled: string | null
};

interface WebhookPayload {
  type: "UPDATE";
  table: string;
  record: bettingrecord;
  schema: "public";
  old_record: null | bettingrecord;
}

async function getUserID(
  supabase: SupabaseClient,
  record: bettingrecord,
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("usersinbetting")
      .select("userID")
      .eq("betterID", record.betterID)
      .single();
    if (error) throw error;
    return data.userID;
  } catch (error) {
    console.log("userID not in usersinbetting");
    return "";
  }
}
async function getClubIds(supabaseClient: SupabaseClient, fixtureID: number) {
  const { data, error } = await supabaseClient
    .from("fixtures")
    .select("team0, team1")
    .eq("fixtureID", fixtureID)
    .single();

  if (error) {
    throw error;
  }

  console.log("Fetched", data);
  return { homeTeamID: data.team0, awayTeamID: data.team1 };
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

function isBetSettled(
  record: bettingrecord,
  oldRecord: bettingrecord,
): boolean {
  console.log("isBetSettled", oldRecord.is_settled === false && record.is_settled === true);
  return oldRecord.is_settled === false && record.is_settled === true;
}

async function addToNotificationsTable(
  supabase: SupabaseClient,
  record: bettingrecord,
  userID: string,
  team0: string,
  team1: string,
) {
  const messageWin =
    `Congratlations! You won your bet on ${team0} vs ${team1}. Enjoy your winnings!`;
  const messageLoss =
    `Unfortunately, you lost your bet on ${team0} vs ${team1}. Better luck next time!`;
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: userID,
        text: record.outcome ? messageWin : messageLoss,
        created_at: new Date(),
        title: "Bet settled!",
      },
    ]);
  if (error) {
    console.log("Error inserting into notifications table");
    throw error};
  console.log(data);
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c3BvYmt1Z3lpcHdxa3FvYXZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjMwNDU1MywiZXhwIjoyMDE3ODgwNTUzfQ.naiRatAl8zh98kl5spT11srWhnnK7sz1fOpZY0m-Q14",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );
  const { homeTeamID, awayTeamID } = await getClubIds(supabaseClient, payload.record.fixtureID);

  if (isBetSettled(payload.record, payload.old_record!)) {
    const userID = await getUserID(supabaseClient, payload.record);
    const { homeTeam, awayTeam } = await getClubInformation(
      supabaseClient,
      homeTeamID,
      awayTeamID,
    );
    await addToNotificationsTable(
      supabaseClient,
      payload.record,
      userID,
      homeTeam,
      awayTeam,
    );
  }


  return new Response();
});
