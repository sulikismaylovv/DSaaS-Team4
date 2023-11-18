import { Injectable } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';

interface LeagueResponse {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreatefriendsleagueService {

  constructor(private supabaseService: SupabaseService) {}

  async createLeague(leagueName: string): Promise<number | undefined> {
    try {
      const response: any = await this.supabaseService.supabaseClient
        .from('friendsleagues')
        .insert([{ name: leagueName }]);

      const data = response.data;
      const error = response.error;

      if (error) {
        console.error('Error creating league:', error);
        throw error;
      }

      if (Array.isArray(data) && data.length > 0) {
        return data[0].id;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error('Error in createLeague:', error);
      throw error;
    }
  }
  async addUserToLeague(userId: string, leagueId: number): Promise<any> {
    const { data, error } = await this.supabaseService.supabaseClient
      .from('usersinfriendsleague')
      .insert([{ userid: userId, leagueid: leagueId }]);

    if (error) {
      console.error('Error adding user to league:', error);
      throw error;
    }

    return data;
  }
}
