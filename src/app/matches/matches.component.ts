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
export class MatchesComponent implements OnInit {

  fixtures: Fixture[] = [];

  currentDate: Date;
  stringDate: string;

  constructor(private apiService: ApiService) {
    // this.currentDate = new Date(); //use this for today's date
    this.currentDate = new Date('2023-11-12'); //use this for specific date
    this.stringDate = this.currentDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.parseFixtures(144);

  }

  parseFixtures(leagueID: number) {
    let dateString = this.getDateAsString(this.currentDate);
    console.log(dateString);
    this.apiService.fetchFixtures(leagueID, dateString).subscribe(
      (data: Fixture[]) => {
        this.fixtures = data;
        console.log(this.fixtures)
      })
  }

  goToNextDay() {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.parseFixtures(144);
  }

  goToPreviousDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.parseFixtures(144);
  }

  getDateAsString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  }
}
