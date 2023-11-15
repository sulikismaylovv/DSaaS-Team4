import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { Club } from './models/club.model';
import { Fixture } from '../models/fixtures.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }


  private apiUrl = 'https://api-football-v1.p.rapidapi.com/v3';

  private headers = new HttpHeaders({
    'X-RapidAPI-Key': 'a2373086ecmsh8b6e5f18c9f297ep1505f8jsn45915d047f0a',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  });


  // fetchTeams(leagueId: number, season: string = '2023'): Observable<Club[]> {
  //   const options = {
  //     params: { league: leagueId.toString(), season: season },
  //     headers: this.headers
  //   };
  //   return this.http.get<{ response: Club[] }>(this.apiUrl + "/teams", options).pipe(
  //     map(response => response.response)
  //   );
  // }


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



  // ---------------------------Below this line is garbage-----------------------------------------------------------

  fetchCompetitions() {
    // return this.http.get(this.apiUrl);
    return this.http.get(`${this.apiUrl}/competitions `, { headers: this.headers });
  }


  fetchStandings(id: number) {
    const options = {
      params: {
        season: '2023',
        league: id.toString()
      },

      headers: this.headers
    };
    return this.http.get(`${this.apiUrl}/standings`, options);
  }

}