import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Player {
  id: number;        // Assuming 'id' is an auto-incremented primary key
  name: string;      // Player's name
  club: number;      // Club's ID, which is a foreign key reference to a club table
  age: number;       // Player's age
  number: number;    // Player's jersey number
  position: string;  // Player's position on the field
  photo: string;     // URL to the player's photo
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(
    private supabase: SupabaseService,
  ) { }

  async fetchPlayersByClubId(clubId: number): Promise<Player[]> {
    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('players')
        .select('*')
        .eq('club', clubId);

      if (error) {
        console.error('Error fetching players for club:', error);
        throw error;
      }
      console.log("Data:", data);
      return data as Player[];
    } catch (error) {
      console.error('Error fetching players by club ID:', error);
      throw error;
    }
  }


}
