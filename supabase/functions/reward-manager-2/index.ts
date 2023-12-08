// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface UserData {
  user_id: string;
  updated_at: Date;
  is_eligible?: boolean;
}




interface UserData {
  user_id: string;
  updated_at: Date;
  is_eligible?: boolean;
}

async function processUserData(supabase: SupabaseClient): Promise<UserData[]> {
  const response = await supabase.auth.admin.listUsers();

  // Check for errors
  if (response.error) {
      console.error(response.error);
      throw response.error;
  }

  // Extract users from the response
  const users = response.data.users;
  console.log("Response from Supabase:", response);
  console.log(`Fetched ${users.length} users`);
  // Process users to create UserData array
  return users.map(user => {
      if (user.updated_at === undefined) {
          // Handle the case where updated_at is undefined
          // For example, throw an error or continue to the next user
          throw new Error('Updated at date is undefined for user ' + user.id);
      }

      const updated_at = new Date(user.updated_at);
      const is_eligible = (new Date().getTime() - updated_at.getTime()) < 24 * 60 * 60 * 1000;
      console.log(`Processing user ${user.id}: updated_at = ${updated_at}, is_eligible = ${is_eligible}`);

      return {
          user_id: user.id,
          updated_at: updated_at,
          is_eligible: is_eligible
      };
  });
}




async function updateUserCreditsAndLogStatus(supabase: SupabaseClient, userData: UserData[]) {
  for (const user of userData) {
    // Always set is_recently_logged to false for each user in the users table
    const { error: logError } = await supabase
      .from('users')
      .update({ is_recently_logged: false })
      .eq('id', user.user_id);

    if (logError) {
      console.error('Error updating log status for user:', user.user_id, logError);
    }

    if (user.is_eligible) {
      // Check if the user exists in the userinbetting table
      let { data: userInBettingData, error: bettingError } = await supabase
        .from('usersinbetting')
        .select('credits')
        .eq('userID', user.user_id)
        .maybeSingle(); // maybeSingle will return null if not found instead of an error

      if (bettingError) {
        console.error('Error checking user in betting table:', user.user_id, bettingError);
        continue; // Skip this user and continue with the next one
      }

      if (userInBettingData) {
        // If the user exists, update the credits by adding 200
        const newCredits = userInBettingData.credits + 200;
        const { error: updateError } = await supabase
          .from('usersinbetting')
          .update({ credits: newCredits })
          .eq('userID', user.user_id);

        console.log('Updated credits for user:', user.user_id, 'to', newCredits);

        if (updateError) {
          console.error('Error updating credits for user:', user.user_id, updateError);
        }
      } else {
        // If the user does not exist, create a new entry with 1000 credits
        const { error: createError } = await supabase
          .from('usersinbetting')
          .insert([{ userID: user.user_id, credits: 1200 }]);

        if (createError) {
          console.error('Error creating user in betting table:', user.user_id, createError);
        }
      }
    }
  }
}




Deno.serve(async (req) => {
  const { url, method } = req;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amhvaWZtYWJ4aXRrZWxmZW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzEzNDc0MywiZXhwIjoyMDEyNzEwNzQzfQ.E7YyyKG0NUWAyk0mmaVUhPd4PeDW2QqNqeX3YtFP6XQ",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );
  const userData = await processUserData(supabaseClient);
  await updateUserCreditsAndLogStatus(supabaseClient, userData);
  return new Response()
})
