import {Component, OnInit} from "@angular/core";
import {DatePipe} from "@angular/common";
import {addDays, compareAsc, endOfWeek, startOfWeek, subDays,} from "date-fns";
import {Fixture} from "../../../core/models/fixtures.model";
import {ApiService} from "../../../core/services/api.service";
import {Router} from "@angular/router";
import {FixtureTransferService} from "../../../core/services/fixture-transfer.service";
import {SupabaseFixture} from "../../../core/models/supabase-fixtures.model";

@Component({
  selector: "app-matches",
  templateUrl: "./matches.component.html",
  styleUrls: ["./matches.component.css"],
  providers: [DatePipe],
})
export class MatchesComponent implements OnInit {
  currentDate: Date;
  startDate: Date = new Date();
  endDate: Date = new Date();
  stringDate: string;
  fixtures: SupabaseFixture[] = [];
  groupedFixtures: { [key: string]: SupabaseFixture[] } = {}; //grouped by date
  groupedFixtureKeys: string[] = [];

  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe,
    private router: Router,
    private fixtureTransferService: FixtureTransferService,
  ) {
    this.currentDate = new Date();
    this.stringDate = this.currentDate.toISOString().split("T")[0];
  }

  onGameSelect(fixture: SupabaseFixture) {
    this.fixtureTransferService.changeFixture(fixture);
    this.router.navigateByUrl("/game/" + fixture.fixtureID, {
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

  async fetchFixturesForWeek() {
    const startDateString = this.getDateAsString(this.startDate);
    const endDateString = this.getDateAsString(this.endDate);
    try {
      const fixtures = await this.apiService.fetchSupabaseFixturesDateRange(
        startDateString,
        endDateString,
      );
      this.fixtures = fixtures;
      this.groupFixturesByDate();
      console.log(this.fixtures);
    } catch (error) {
      console.log(error);
    }
  }

  getGroupedFixtureKeys(): string[] {
    return Object.keys(this.groupedFixtures);
  }

  groupFixturesByDate(): void {
    this.groupedFixtures = {};

    this.fixtures.forEach((fixture) => {
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
    this.groupedFixtureKeys.forEach((dateKey) => {
      this.groupedFixtures[dateKey].sort((a, b) =>
        compareAsc(new Date(a.time), new Date(b.time))
      );
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
}
