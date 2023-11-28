import { Component, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { initFlowbite } from "flowbite";
import {
  addDays,
  compareAsc,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { groupBy } from "lodash";
import { Fixture } from "../../../core/models/fixtures.model";
import { ApiService } from "../../../core/services/api.service";
import { Router } from "@angular/router";
import { FixtureTransferService } from "../../../core/services/fixture-transfer.service";
import { SupabaseFixture } from "../../../core/models/supabase-fixtures.model";

@Component({
  selector: "app-matches",
  templateUrl: "./matches.component.html",
  styleUrls: ["./matches.component.css"],
  providers: [DatePipe],
})
export class MatchesComponent implements OnInit {
  fixtures: Fixture[] = [];
  groupedFixtures: { [key: string]: SupabaseFixture[] } = {}; //grouped by date
  groupedFixtureKeys: string[] = [];
  currentDate: Date;
  startDate: Date = new Date();
  endDate: Date = new Date();
  stringDate: string;
  supabaseFixtures: SupabaseFixture[] = [];
  groupSupabaseFixtures: { [key: string]: Fixture[] } = {}; //grouped by date

  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe,
    private router: Router,
    private fixtureTransferService: FixtureTransferService,
  ) {
    this.currentDate = new Date(); //use this for today's date
    // this.currentDate = new Date('2023-11-12'); //use this for specific date
    this.stringDate = this.currentDate.toISOString().split("T")[0];
  }

  onGameSelect(fixture: Fixture) {
    this.fixtureTransferService.changeFixture(fixture);
    this.router.navigateByUrl("/game/" + fixture.fixture.id, {
      state: { fixture: fixture },
    });
  }
  ngOnInit() {
    this.setWeek(new Date());
    this.fetchFixturesForWeek();
  }

  goToGamePage(fixture: Fixture) {
    this.router.navigateByUrl("/game/" + fixture.fixture.id, {
      state: { fixture: fixture },
    });
  }

  // Set the start of the week to Friday and end to next Thursday
  setWeek(date: Date) {
    this.startDate = startOfWeek(date, { weekStartsOn: 5 });
    this.endDate = endOfWeek(date, { weekStartsOn: 5 });
  }

  // fetchFixturesForWeek() {
  //   let startDateString = this.getDateAsString(this.startDate);
  //   let endDateString = this.getDateAsString(this.endDate);

  //   // Fetch fixtures for the week range
  //   this.apiService.fetchFixturesDateRange(144, startDateString, endDateString).subscribe(
  //     (data: Fixture[]) => {
  //       this.fixtures = data;
  //       console.log(this.fixtures);
  //       this.groupFixturesByDate();

  //     }
  //   );
  // }
  async fetchFixturesForWeek() {
    let startDateString = this.getDateAsString(this.startDate);
    let endDateString = this.getDateAsString(this.endDate);
    try {
      let fixtures = await this.apiService.fetchSupabaseFixturesDateRange(
        startDateString,
        endDateString,
      );
      this.supabaseFixtures = fixtures;
      this.groupFixturesByDate();
      console.log(this.supabaseFixtures);
    } catch (error) {
      console.log(error);
    }
  }

  getGroupedFixtureKeys(): string[] {
    return Object.keys(this.groupedFixtures);
  }

  // groupFixturesByDate() {
  //   // Group the fixtures by date
  //   this.groupedFixtures = groupBy(this.fixtures, (fixture) => {
  //     return format(parseISO(fixture.fixture.date), 'yyyy-MM-dd');
  //   });

  //   // Sort the groups by date
  //   this.groupedFixtureKeys = Object.keys(this.groupedFixtures).sort();

  //   // Sort fixtures within each group by the full date and time
  //   this.groupedFixtureKeys.forEach(date => {
  //     this.groupedFixtures[date].sort((a, b) => compareAsc(parseISO(a.fixture.date), parseISO(b.fixture.date)));
  //   });
  // }


  groupFixturesByDate(): void {
    // Clear the existing grouped fixtures
    this.groupedFixtures = {};
  
    // Iterate over the supabase fixtures
    this.supabaseFixtures.forEach((fixture) => {
      // Ensure that time is a Date object
      const fixtureDate = new Date(fixture.time);
  
      // Formats the date to YYYY-MM-DD format
      const dateKey = fixtureDate.toISOString().split("T")[0];
  
      if (!this.groupedFixtures[dateKey]) {
        this.groupedFixtures[dateKey] = [];
      }
  
      this.groupedFixtures[dateKey].push(fixture);
    });
  
    // Sort the groups by date
    this.groupedFixtureKeys = Object.keys(this.groupedFixtures).sort();
  
    // Sort fixtures within each group by the full date and time
    this.groupedFixtureKeys.forEach(dateKey => {
      this.groupedFixtures[dateKey].sort((a, b) => compareAsc(new Date(a.time), new Date(b.time)));
    });
  }
  
  


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
    return adjustedDate.toISOString().split("T")[0];
  }

  //convert from type Date to type string MMM d
  formatShortDate(date: Date): string {
    return this.datePipe.transform(date, "MMM d") || "";
  }

  //convert from type string YYYY-MM-DD to type string MMM d
  formatShortDateString(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  //--------------------------------------------- everything below this line is not used it is for one day for fixtures only so it's not used---------------------------------------------
  parseFixtures(leagueID: number) {
    let dateString = this.getDateAsString(this.currentDate);
    console.log(dateString);
    this.apiService.fetchFixtures(leagueID, dateString).subscribe(
      (data: Fixture[]) => {
        this.fixtures = data;
        console.log(this.fixtures);
      },
    );
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
