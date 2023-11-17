import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Fixture } from '../models/fixtures.model';
import { DatePipe } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { format, parseISO, compareAsc , startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';
import { groupBy } from 'lodash';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
  providers: [DatePipe]
})
export class MatchesComponent implements OnInit {

  fixtures: Fixture[] = [];
  groupedFixtures: {[key: string]: Fixture[]} = {};  //grouped by date
  groupedFixtureKeys: string[] = [];
  currentDate: Date;
  startDate: Date = new Date();
  endDate: Date = new Date();
  stringDate: string;

  constructor(private apiService: ApiService, private datePipe: DatePipe) {
    this.currentDate = new Date(); //use this for today's date
    // this.currentDate = new Date('2023-11-12'); //use this for specific date
    this.stringDate = this.currentDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.setWeek(new Date());
    this.fetchFixturesForWeek();
  }

  // Set the start of the week to Friday and end to next Thursday
  setWeek(date: Date) {
    this.startDate = startOfWeek(date, { weekStartsOn: 5 });
    this.endDate = endOfWeek(date, { weekStartsOn: 5 });
  }

  fetchFixturesForWeek() {
    let startDateString = this.getDateAsString(this.startDate);
    let endDateString = this.getDateAsString(this.endDate);

    // Fetch fixtures for the week range
    this.apiService.fetchFixturesDateRange(144, startDateString, endDateString).subscribe(
      (data: Fixture[]) => {
        this.fixtures = data;
        console.log(this.fixtures);
        this.groupFixturesByDate();

      }
    );
  }

  // logList(){
  //   this.groupFixturesByDate()
  //   console.log("grouping fixtures by date");
  //   console.log(this.groupedFixtures);
  // }

  getGroupedFixtureKeys(): string[] {
    return Object.keys(this.groupedFixtures);
  }

  // groupFixturesByDate() {
  //   this.groupedFixtures = groupBy(this.fixtures, (fixture) => fixture.fixture.date);
  //   this.groupedFixtureKeys = Object.keys(this.groupedFixtures); // Update the keys after grouping
  // }

  // groupFixturesByDate() {
  //   this.groupedFixtures = groupBy(this.fixtures, (fixture) => fixture.fixture.date);
  // }
  groupFixturesByDate() {
    // Group the fixtures by date
    this.groupedFixtures = groupBy(this.fixtures, (fixture) => {
      return format(parseISO(fixture.fixture.date), 'yyyy-MM-dd');
    });

    // Sort the groups by date
    this.groupedFixtureKeys = Object.keys(this.groupedFixtures).sort();

    // Sort fixtures within each group by the full date and time
    this.groupedFixtureKeys.forEach(date => {
      this.groupedFixtures[date].sort((a, b) => compareAsc(parseISO(a.fixture.date), parseISO(b.fixture.date)));
    });
  }

  // getGroupedFixtureDates(): string[] {
  //   return Object.keys(this.groupedFixtures);
  // }

  goToNextWeek() {
    this.setWeek(addDays(this.startDate, 7));
    this.fetchFixturesForWeek();
  }

  goToPreviousWeek() {
    this.setWeek(subDays(this.startDate, 7));
    this.fetchFixturesForWeek();
  }

  //convert from type Date to type string YYYY-MM-DD
  getDateAsString(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  }

  //convert from type Date to type string MMM d
  formatShortDate(date: Date): string {
    return this.datePipe.transform(date, 'MMM d') || '';
  }

  //convert from type string YYYY-MM-DD to type string MMM d
  formatShortDateString(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
  //--------------------------------------------- everything below this line is not used it is for one day for fixtures only so it's not used---------------------------------------------
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


}
