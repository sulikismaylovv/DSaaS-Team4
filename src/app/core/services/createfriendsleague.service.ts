import { Injectable } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';

interface League {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreatefriendsleagueService {

  constructor(private supabaseService: SupabaseService) {}

  async createLeague(leagueName: string): Promise<number | undefined> {
    try {
      const response = await this.supabaseService.supabaseClient
        .from('friendsleagues')
        .insert([{ name: leagueName }])
        .single();

      console.log('Response from Supabase:', response); // Log the entire response

      // Use any type to bypass TypeScript's static type checking.
      // This is not recommended for production code unless you are certain of the shape of your data.
      const data: any = response.data;
      const error = response.error;

      if (error) {
        console.error('Error creating league:', error);
        return undefined;
      }

      // Assuming the data object contains an 'id' property.
      return data?.id;

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
