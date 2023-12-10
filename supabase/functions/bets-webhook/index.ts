import { SupabaseClient , createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

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

interface BetRecord {
  id: number;
  betterID: number;
  fixtureID: number;
  time_placed: Date;
  team_chosen: string;
  credits: number;
  is_settled: boolean | null;
  outcome: boolean | null;
  time_settled: string | null;
}

interface SettleBetInfo{
  betterID: number;
  credits: number;
  winner: string;
  outcome: boolean;
}
async function getBetsForFixture(record: WebhookPayload, supabaseClient: SupabaseClient): Promise<BetRecord[]>{ 
  try{
    const { data, error } = await supabaseClient
    .from("bettingrecord")
    .select("*")
    .eq("fixtureID", record.record.fixtureID)
    .eq("is_settled", false);
    if (error) {
      throw error;
  }

  return data;
  } catch ( error) {
    console.log("Error getting bets for fixture");
    throw error;
  }
}

function determineWinner(record: FixtureRecord): string {
  if (record.home_goals !== null && record.away_goals !== null) {
    if (record.home_goals > record.away_goals) {
      return "home";
    } else if (record.home_goals < record.away_goals) {
      return "away";
    } else {
      return "draw";
    }
  }
  return "Unknown";
}

async function settleBets(bets: BetRecord[], record: FixtureRecord, supabaseClient: SupabaseClient): Promise<SettleBetInfo[]> {
  const settledBets: SettleBetInfo[] = [];
  const winner = determineWinner(record);
  for (const bet of bets) {
    try {
      const { error } = await supabaseClient
        .from("bettingrecord")
        .update({ is_settled: true, outcome: bet.team_chosen === winner, time_settled: new Date()})
        .eq("id", bet.id);

      if (error) {
        console.log("Error settling bets");
        throw error;
      }

      settledBets.push({
        betterID: bet.betterID,
        credits: bet.credits,
        outcome: bet.team_chosen === determineWinner(record),
        winner: determineWinner(record),
      });
    } catch (error) {
      console.error("Error processing bet: ", error);
      // Handle the error based on your application's requirements
    }
  }

  return settledBets;
}

async function rewardUser(bet: SettleBetInfo, supabaseClient: SupabaseClient, record: WebhookPayload): Promise<void> {
  try {
    let odds;
    if (bet.winner === "home") {
      odds = record.record.odds_home;
    } else if (bet.winner === "away") {
      odds = record.record.odds_away;
    } else if (bet.winner === "draw") {
      odds = record.record.odds_draw;
    } else {
      console.log("Invalid bet winner type");
      return;
    }

    // Ensure odds are not null
    if (odds === null) {
      console.log("Odds are null");
      return;
    }

    const amountToReward = bet.outcome ? bet.credits * odds : 0;
    const xpToAdd = bet.outcome ? 100 * odds : 50;

    // Retrieve the current credits, activeCredits, and xp of the user
    const { data: userData, error: retrieveError } = await supabaseClient
      .from("usersinbetting")
      .select("credits, activeCredits, xp")
      .eq("betterID", bet.betterID)
      .single();

    if (retrieveError) {
      console.error("Error retrieving user data: ", retrieveError);
      return;
    }

    const newCredits = (userData.credits || 0) + amountToReward;
    const newActiveCredits = (userData.activeCredits || 0) - bet.credits;
    const newXp = (userData.xp || 0) + xpToAdd;

    // Update the user's credits, activeCredits, and xp
    const { error: updateError } = await supabaseClient
      .from("usersinbetting")
      .update({ credits: newCredits, activeCredits: newActiveCredits, xp: newXp })
      .eq("betterID", bet.betterID);

    if (updateError) {
      console.error("Error updating user data: ", updateError);
    }
  } catch (error) {
    console.error("Error in rewardUser function: ", error);
  }
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
  );if(payload.record.is_finished === true) {

    const bets = await getBetsForFixture(payload, supabaseClient);
    const settledBets = await settleBets(bets, payload.record, supabaseClient);
    for (const bet of settledBets) {
      console.log("Rewarding user");
      await rewardUser(bet, supabaseClient, payload);
    }
  } 
    
  return new Response( null, { status: 200 })
})

