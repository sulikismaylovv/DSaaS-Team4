import {Injectable} from '@angular/core';
import {SupabaseService} from 'src/app/core/services/supabase.service';
import {AuthService} from "./auth.service";
import {SafeResourceUrl} from "@angular/platform-browser";

export interface FriendsLeagueInterface {
  id?: number;       // Optional as it will be generated by the database
  name: string;
  user_id: string;
  created_at?: Date;
}

export interface EnhancedUserInFriendsLeague extends UserInFriendsLeague
{
  username: string;
  avatarSafeUrl?: SafeResourceUrl | undefined;

}
export interface UserInFriendsLeague {
  id?: number;
  userid: string;
  leagueid:number;
  xp:number;
}
@Injectable({
  providedIn: 'root'
})

export class FriendsLeague {
  constructor(private supabase: SupabaseService, private authService: AuthService) {
  }

  async getLeaguesIDForCurrentUser(): Promise<any[]> {
    const currentUserId = this.authService.session?.user?.id;
    if (!currentUserId) {
      console.error('Current user ID is undefined.');
      return [];
    }

    const {data, error} = await this.supabase.supabaseClient
      .from('usersinfriendsleague')
      .select('leagueid')
      .eq('userid', currentUserId);

    if (error) {
      console.error('Error fetching leagues for current user:', error);
      throw error;
    }
    const leagueIds = data.map((record) => record.leagueid);
    return leagueIds;
  }

  async getLeaguesByIds(leagueIds: number[]): Promise<FriendsLeagueInterface[]> {
    const {data, error} = await this.supabase.supabaseClient
      .from('friendsleagues') // Use the generic to type the response data
      .select('*')
      .in('id', leagueIds);

    if (error) {
      console.error('Error fetching league names:', error);
      throw error;
    }

    return data;
  }

  async getMembersForLeagues(leagueIds: number[]): Promise<{ [key: number]: UserInFriendsLeague[] }> {
    const leagueMembers: { [key: number]: UserInFriendsLeague[] } = {};

    for (const leagueId of leagueIds) {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinfriendsleague')
        .select(`
          id,
          userid,
          leagueid,
          xp`)
        .eq('leagueid', leagueId)
        .order('xp', {ascending: false});

      if (error) {
        console.error(`Error fetching members for league ${leagueId}:`, error);
        // Initialize with an empty array in case of an error
        leagueMembers[leagueId] = [];
      } else {
        // Store the members in the object, keyed by leagueId
        leagueMembers[leagueId] = data;
      }
    }

    // Always return the leagueMembers object, even if it's empty
    return leagueMembers;
  }


  async getLeaguesIDForUser(userId: string): Promise<number[]> {
    const {data, error} = await this.supabase.supabaseClient
      .from('usersinfriendsleague')
      .select('leagueid')
      .eq('userid', userId);

    if (error) {
      console.error(`Error fetching leagues for user ${userId}:`, error);
      throw error;
    }

    return data.map(record => record.leagueid);
  }
}

export class FriendsLeagueServiceService {
}
