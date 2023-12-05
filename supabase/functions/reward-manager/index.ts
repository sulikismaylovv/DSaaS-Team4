// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface UserData{
  user_id: string;
  updated_at: Date;
  is_eligible?: boolean;
}



async function getUserData(supabase: SupabaseClient): Promise<UserData[]> {
  const {data, error} = await supabase.auth.admin.listUsers();
  // let { data, error } = await supabase
  //   .from('auth.users')
  //   .select('id, updated_at');

  if (error) {
    console.error(error);
    return []; // Return an empty array in case of an error
  }

  if (!data) {
    return []; // Return an empty array if data is undefined
  }

  // Map the data to the UserData interface and check eligibility
  const users: UserData[] = data.map(user => {
    const updatedDate = new Date(user.updated_at);
    const currentDate = new Date();
    const hoursDifference = (currentDate.getTime() - updatedDate.getTime()) / (1000 * 60 * 60);

    return {
      user_id: user.id,
      updated_at: updatedDate,
      is_eligible: hoursDifference <= 24
    };
  });

  return users;
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
        .from('userinbetting')
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
          .from('userinbetting')
          .update({ credits: newCredits })
          .eq('userID', user.user_id);

        if (updateError) {
          console.error('Error updating credits for user:', user.user_id, updateError);
        }
      } else {
        // If the user does not exist, create a new entry with 1000 credits
        const { error: createError } = await supabase
          .from('userinbetting')
          .insert([{ userID: user.user_id, credits: 1000 }]);

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
    "***",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );
  const userData = await getUserData(supabaseClient);
  updateUserCreditsAndLogStatus(supabaseClient, userData);
  return new Response()
})
