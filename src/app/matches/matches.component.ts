import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Fixture } from '../models/fixtures.model';
import { DatePipe } from '@angular/common';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit{

  constructor(private apiService: ApiService) { }
  fixtures: Fixture[] = [];

  ngOnInit() {
    this.parseFixtures(144, '2023-10-22');

  }

  parseFixtures(leagueID: number, date: string) {
    this.apiService.fetchFixtures(leagueID, date).subscribe(
      (data: Fixture[]) => {
        this.fixtures = data;
        console.log(this.fixtures)
      })
  }
}
