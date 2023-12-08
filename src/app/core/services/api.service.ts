import {Injectable} from "@angular/core";
import {SupabaseService} from "./supabase.service";
import {SupabaseFixture} from "../models/supabase-fixtures.model";
import {Club} from "../models/club.model";

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

  async fetchSingleSupabaseFixture(fixtureID: number): Promise<SupabaseFixture> {
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


}
