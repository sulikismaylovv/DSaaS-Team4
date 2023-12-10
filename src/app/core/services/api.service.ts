import { Injectable } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { SupabaseFixture } from "../models/supabase-fixtures.model";
import { Club } from "../models/club.model";
import { Player } from "../models/player.model";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private supabase: SupabaseService) {}

  async fetchStandings(): Promise<Club[]> { // This should return an array of Club
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("clubs")
        .select("id, name, points, goal_difference") // Select only the required fields
        .order("points", { ascending: false }); // Order by points in descending order

      if (error) {
        throw error;
      }

      // Map the data to match the Club interface if the column names are different
      return data.map((club: any) => ({
        id: club.id,
        name: club.name,
        points: club.points,
        goalDifference: club.goal_difference, // Assuming the column name is goal_difference
      }));
    } catch (error) {
      console.error("Error fetching standings:", error);
      throw error;
    }
  }

  async fetchSquad(clubID: number): Promise<Player[]> {
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("players")
        .select("*")
        .eq("club", clubID)
        .order("number", { ascending: true });

      if (error) {
        throw error;
      }

      // Define a type for the position order
      type PositionOrder = {
        [key: string]: number;
      };

      const positionOrder: PositionOrder = {
        "Goalkeeper": 1,
        "Defender": 2,
        "Midfielder": 3,
        "Attacker": 4,
      };

      // Sort the data in the desired order
      const sortedData = data.sort((a, b) => {
        const positionA = positionOrder[a.position as keyof PositionOrder] || 5;
        const positionB = positionOrder[b.position as keyof PositionOrder] || 5;

        if (positionA !== positionB) {
          return positionA - positionB;
        }

        // If positions are the same, sort by number ascending
        return a.number - b.number;
      });

      return data.map((player: any) => ({
        id: player.id,
        name: player.name,
        club: clubID,
        age: player.age,
        number: player.number,
        position: player.position,
        photo: player.photo,
      }));
    } catch (error) {
      console.error("Error fetching squad:", error);
      throw error;
    }
  }

  async fetchPlayer(playerID: number): Promise<Player> {
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("players")
        .select("*")
        .eq("id", playerID)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching player:", error);
      throw error;
    }
  }

  async fetchLineup(fixtureID: number): Promise<string> {
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("fixtures")
        .select("lineup")
        .eq("fixtureID", fixtureID)
        .single();

      if (error) {
        throw error;
      }

      return data.lineup;
    } catch (error) {
      console.error("Error fetching lineup:", error);
      throw error;
    }
  }

  async fetchSupabaseFixturesDateRange(
    startDate: string,
    endDate: string,
  ): Promise<SupabaseFixture[]> {
    try {
      // Convert dates to start of the start date and end of the end date
      const startDateTime = new Date(startDate).toISOString();
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // Set time to the end of the day
      const endDateTimeISO = endDateTime.toISOString();

      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("fixtures")
        .select(`
          *,
          club0:clubs!fixtures_team0_fkey (
            id,
            name,
            logo
          ),
          club1:clubs!fixtures_team1_fkey (
            id,
            name,
            logo
          )        `)
        .gte("time", startDateTime)
        .lte("time", endDateTimeISO);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching fixtures with club info:", error);
      throw error;
    }
  }

  async fetchSingleSupabaseFixture(
    fixtureID: number,
  ): Promise<SupabaseFixture> {
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("fixtures")
        .select(`
          *,
          club0:clubs!fixtures_team0_fkey (
            id,
            name,
            logo
          ),
          club1:clubs!fixtures_team1_fkey (
            id,
            name,
            logo
          )        `)
        .eq("fixtureID", fixtureID)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching fixtures with club info:", error);
      throw error;
    }
  } 

  async testFunction(
    clubID: number,
  ): Promise<SupabaseFixture> {
    try {
      // Fetch data from Supabase with club information
      const { data, error } = await this.supabase.supabaseClient
        .from("fixtures")
        .select(`
          *,
          club0:clubs!fixtures_team0_fkey (
            id,
            name,
            logo
          ),
          club1:clubs!fixtures_team1_fkey (
            id,
            name,
            logo
          )        `)
        .eq("team0", clubID)
        .gte("time", new Date().toISOString())
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching fixtures with club info:", error);
      throw error;
    }
  } 
  async fetchNextFixture(clubID: number): Promise<SupabaseFixture[]> {
    try {
      const currentDate = new Date().toISOString();
      console.log(`Fetching fixtures greater than or equal to: ${currentDate}`);
      
      const { data, error } = await this.supabase.supabaseClient
        .from("fixtures")
        .select(`
          *,
          club0:clubs!fixtures_team0_fkey (
            id,
            name,
            logo
          ),
          club1:clubs!fixtures_team1_fkey (
            id,
            name,
            logo
          )
        `)
        .or(`team0.eq.${clubID},team1.eq.${clubID}`)
        .gte("time", currentDate)
        .order("time", { ascending: true });
  
      if (error) {
        console.error("Supabase error:", error.message);
        throw error;
      }
  
      if (!data || data.length === 0) {
        console.log("No fixtures found with the current query parameters.");
        return []; // or handle this case as needed
      }
  
      console.log("Fetched data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching next fixture:", error);
      throw error;
    }
  }
  

  // async fetchNextFixture(clubID: number): Promise<SupabaseFixture> {
  //   try {
  //     // Fetch data from Supabase with club information
  //     const{data,error} = await  this.supabase.supabaseClient
  //       .from("fixtures")
  //       .select(`
  //         *,
  //         club0:clubs!fixtures_team0_fkey (
  //           id,
  //           name,
  //           logo
  //         ),
  //         club1:clubs!fixtures_team1_fkey (
  //           id,
  //           name,
  //           logo
  //         )        `)
  //         .eq("taeam0", clubID)
  //       .gte("time", new Date().toISOString())
  //       .order("time", { ascending: true })
  //       .single();
  //       console.log("data", data);
  //       return data
  //   } catch (error) {
  //     console.error("Error fetching next fixture:", error);
  //     throw error;
  //   }
  // }
}
