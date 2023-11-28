import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Fixture } from "../models/fixtures.model";
import { Lineup } from "../models/lineup.model";
import { SupabaseService } from "./supabase.service";
import { SupabaseFixture } from "../models/supabase-fixtures.model";
import { ca } from "date-fns/locale";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient, private supabase: SupabaseService) {}

  // async fetchSupabaseFixturesDateRange(startDate: string, endDate: string): Promise<SupabaseFixture[]> {
  //   try {
  //     // Convert dates to start of the start date and end of the end date
  //     const startDateTime = new Date(startDate).toISOString();
  //     const endDateTime = new Date(endDate);
  //     endDateTime.setHours(23, 59, 59, 999); // Set time to the end of the day
  //     const endDateTimeISO = endDateTime.toISOString();

  //     // Fetch data from Supabase
  //     const { data, error } = await this.supabase.supabaseClient
  //       .from('fixtures')
  //       .select('*')
  //       .gte('time', startDateTime)
  //       .lte('time', endDateTimeISO);

  //     if (error) {
  //       throw error;
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching fixtures:', error);
  //     throw error;
  //   }
  // }

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

  fetchFixturesDateRange(
    leagueId: number,
    startDate: string,
    endDate: string,
    season: string = "2023",
  ): Observable<Fixture[]> {
    const options = {
      params: {
        league: leagueId.toString(),
        season: season,
        from: startDate,
        to: endDate,
      },
      headers: this.headers,
    };
    return this.http.get<{ response: Fixture[] }>(
      this.apiUrl + "/fixtures",
      options,
    ).pipe(
      map((response) => response.response),
    );
  }
  private apiUrl = "https://api-football-v1.p.rapidapi.com/v3";

  private headers = new HttpHeaders({
    "X-RapidAPI-Key": "a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a",
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
  });

  fetchLineups(fixtureID: number): Observable<Lineup[]> {
    const options = {
      params: {
        fixture: fixtureID.toString(),
      },
      headers: this.headers,
    };
    return this.http.get<{ response: Lineup[] }>(
      this.apiUrl + "/fixtures/lineups",
      options,
    ).pipe(
      map((response) => response.response),
    );
  }

  fetchSpecificFixture(fixtureID: number): Observable<Fixture[]> {
    const options = {
      params: {
        id: fixtureID.toString(),
      },
      headers: this.headers,
    };
    return this.http.get<{ response: Fixture[] }>(
      this.apiUrl + "/fixtures",
      options,
    ).pipe(
      map((response) => response.response),
    );
  }

  fetchFixtures(
    leagueId: number,
    date: string,
    season: string = "2023",
  ): Observable<Fixture[]> {
    const options = {
      params: {
        league: leagueId.toString(),
        season: season,
        date: date,
      },
      headers: this.headers,
    };
    return this.http.get<{ response: Fixture[] }>(
      this.apiUrl + "/fixtures",
      options,
    ).pipe(
      map((response) => response.response),
    );
  }
}
