import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Fixture } from '../models/fixtures.model';
import { Lineup } from '../models/lineup.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private supabase: SupabaseService) { }

  


  private apiUrl = 'https://api-football-v1.p.rapidapi.com/v3';

  private headers = new HttpHeaders({
    'X-RapidAPI-Key': 'a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  });

  fetchLineups(fixtureID: number): Observable<Lineup[]> {
    const options = {
      params: {
        fixture: fixtureID.toString()
      },
      headers: this.headers
    };
    return this.http.get<{ response: Lineup[] }>(this.apiUrl + "/fixtures/lineups", options).pipe(
      map(response => response.response)
    );
  }


  fetchSpecificFixture(fixtureID: number): Observable<Fixture[]> {
    const options = {
      params: {
        id: fixtureID.toString()      },
      headers: this.headers
    };
    return this.http.get<{ response: Fixture[] }>(this.apiUrl + "/fixtures", options).pipe(
      map(response => response.response)
    );
  }

  fetchFixtures(leagueId: number, date: string, season: string = '2023'): Observable<Fixture[]> {
    const options = {
      params: {
        league: leagueId.toString(),
        season: season,
        date: date
      },
      headers: this.headers
    };
    return this.http.get<{ response: Fixture[] }>(this.apiUrl + "/fixtures", options).pipe(
      map(response => response.response)
    );
  }

  fetchFixturesDateRange(leagueId: number, startDate: string, endDate: string, season: string = '2023'): Observable<Fixture[]> {
    const options = {
      params: {
        league: leagueId.toString(),
        season: season,
        from: startDate,
        to: endDate
      },
      headers: this.headers
    };
    return this.http.get<{ response: Fixture[] }>(this.apiUrl + "/fixtures", options).pipe(
      map(response => response.response)
    );
  }


}
