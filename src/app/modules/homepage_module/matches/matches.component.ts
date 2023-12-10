import {Component, OnInit} from "@angular/core";
import {DatePipe} from "@angular/common";
import {addDays, compareAsc, endOfWeek, startOfWeek, subDays,} from "date-fns";
import {ApiService} from "../../../core/services/api.service";
import {Router} from "@angular/router";
import {FixtureTransferService} from "../../../core/services/fixture-transfer.service";
import {SupabaseFixture , club} from "../../../core/models/supabase-fixtures.model";
import {AuthService} from "../../../core/services/auth.service";
import {PreferencesService} from "../../../core/services/preference.service";


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

  favoriteClubId?: number;
  followedClubIds: number[] = [];

  constructor(
    private apiService: ApiService,
    private datePipe: DatePipe,
    private router: Router,
    protected authService: AuthService,
    private fixtureTransferService: FixtureTransferService,
    private preferenceService: PreferencesService
  ) {
    this.currentDate = new Date();
    this.stringDate = this.currentDate.toISOString().split("T")[0];
  }

    async onGameSelect(fixture: SupabaseFixture) {
        if (this.authService.isLogged()) {
            console.log("Authenticated");
            this.fixtureTransferService.changeFixture(fixture);
            await this.router.navigateByUrl("/game/" + fixture.fixtureID, {
                state: {fixture: fixture},
            });
        } else {
            await this.router.navigateByUrl("/login");
        }
  }

  async ngOnInit() {
    this.groupFixturesByDate(); // Call this method at the end to ensure fixtures are grouped after filtering
    this.setWeek(new Date());
    await this.fetchFixturesForWeek();
    if (this.authService.isLogged()) {
      await this.loadUserPreferences();
      this.filterFixturesForUserPreferences();
    }

    console.log(this.fixtures);

  }

  hasFixturesForDate(date: string): boolean {
    return this.groupedFixtures[date]?.length > 0;
  }

  hasFollowingClubs(): boolean {
    return this.followedClubIds.length > 0;
  }

  hasFollowedFixtureforDate(date: string): boolean {
    return this.groupedFixtures[date]?.some(fixture => this.isClubRelevantToUserPreferences(fixture.club0) || this.isClubRelevantToUserPreferences(fixture.club1));
  }

  hasNonFollowedFixtureforDate(date: string): boolean {
    return this.groupedFixtures[date]?.some(fixture => !this.isClubRelevantToUserPreferences(fixture.club0) && !this.isClubRelevantToUserPreferences(fixture.club1));
  }

  // Set the start of the week to Friday and end to next Thursday
  setWeek(date: Date) {
    this.startDate = startOfWeek(date, { weekStartsOn: 5 });
    this.endDate = endOfWeek(date, { weekStartsOn: 5 });
  }

  async loadUserPreferences() {
    // Replace with your actual preference fetching logic
    const preferences = await this.preferenceService.getPreferences(<string>this.authService.session?.user?.id);

    // Parse the favorite club ID as a number, if it exists
    const favoritePreference = preferences.find(p => p.favorite_club);
    this.favoriteClubId = favoritePreference ? parseInt(favoritePreference.club_id) : undefined;

    // Parse the followed club IDs as numbers
    this.followedClubIds = preferences
        .filter(p => p.followed_club)
        .map(p => parseInt(p.club_id))
        .filter(id => !isNaN(id)); // Filter out any NaN results from parseInt

  }

  async fetchFixturesForWeek() {
    const startDateString = this.getDateAsString(this.startDate);
    const endDateString = this.getDateAsString(this.endDate);

    try {
      this.fixtures = await this.apiService.fetchSupabaseFixturesDateRange(startDateString, endDateString);
      this.groupFixturesByDate();
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    }
  }
  
   formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();

    // Remove the time part for accurate comparison of dates
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
        // Format the time as "6:00 PM"
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else {
        // Check if the date is tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowWithoutTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

        if (dateWithoutTime.getTime() === tomorrowWithoutTime.getTime()) {
            return 'Tomorrow';
        } else {
            // Format the date as "Dec 16"
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
}

  
  didFixtureStart(fixture: SupabaseFixture): boolean {
    const fixtureDate = new Date(fixture.time);
    const currentDate = new Date();
    return currentDate > fixtureDate;
  }

  filterFixturesForUserPreferences() {
    // Ensure we only filter if the user is logged in
    const isLoggedIn = this.authService.isLogged() || false;
    if (isLoggedIn) {
      this.fixtures = this.fixtures.filter(fixture =>
        this.isClubRelevantToUserPreferences(fixture.club0) ||
        this.isClubRelevantToUserPreferences(fixture.club1)
      );
    }
  }

  // This method must ensure club is not undefined before it proceeds
  isClubRelevantToUserPreferences(club: club | undefined): boolean {
    if (!club) return false; // Return false immediately if club is undefined
    const isLoggedIn = this.authService.isLogged() || false;
    return isLoggedIn && (club.id === this.favoriteClubId || this.followedClubIds.includes(club.id));
  }

  isFavoriteClubFixture(fixture: SupabaseFixture): boolean {
    if (this.authService.isLogged()) {
      const isFavorite = (fixture.club0 && fixture.club0.id === this.favoriteClubId) ||
        (fixture.club1 && fixture.club1.id === this.favoriteClubId);

      return <boolean>isFavorite;
    }
    return false;
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
