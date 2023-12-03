import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface PlayerWithClubDetails extends Player {
    clubname: string; // Assuming 'name' is the property you want from the club details
}
export interface Club {
  id?: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
  leagueID: number;
}
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

  async fetchPlayersByClubId(clubId: number): Promise<PlayerWithClubDetails[]> {
    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('players')
        .select(`
          *,
          club:clubs ( name )
        `)
        .eq('club', clubId);

      if (error) {
        console.error('Error fetching players for club:', error);
        throw error;
      }

      // Transform the data to include the club name directly on the player objects
      const playersWithClubName = data.map(player => ({
        ...player,
        clubname: player.club.name // Make sure the club object exists and has a name property
      }));

      return playersWithClubName as PlayerWithClubDetails[];
    } catch (error) {
      console.error('Error fetching players by club ID:', error);
      throw error;
    }
  }

}
