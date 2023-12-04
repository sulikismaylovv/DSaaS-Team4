import { Component, OnInit } from "@angular/core";
import { ThemeService } from "../../core/services/theme.service";
import { Fixture, FixtureModel } from "src/app/core/models/fixtures.model";
import { DatePipe } from "@angular/common";
import { NavbarService } from "../../core/services/navbar.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FixtureTransferService } from "../../core/services/fixture-transfer.service";
import { Lineup, LineupModel } from "src/app/core/models/lineup.model";
import { ApiService } from "src/app/core/services/api.service";
import { LineupComponent } from "./lineup/lineup.component";
import { groupBy } from "lodash";
import { BetModel } from "src/app/core/models/bets.model";
import { Bet } from "src/app/core/models/bets.model";
import { BetsService } from "src/app/core/services/bets.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ChangeDetectorRef } from "@angular/core";
import {
  SupabaseFixture,
  SupabaseFixtureModel,
} from "src/app/core/models/supabase-fixtures.model";
import { is } from "date-fns/locale";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
  providers: [DatePipe],
})
export class GameComponent implements OnInit {
  showContent: boolean = false;
  clickedImage: string | null = null;
  fixture: SupabaseFixture = new SupabaseFixtureModel();
  lineups: Lineup[] = [];
  lineupHome: { [key: number]: { name: string; number: number }[] } = {};
  lineupAway: { [key: number]: { name: string; number: number }[] } = {};
  isLoading: boolean = true;
  // bet: BetModel = null!;
  teamToWin: boolean | null = null;
  teamChosen: string | null = null;
  betAmount: number = 200;
  availableCredits: number = 0;
  betCanBePlaced: boolean = false;

  time: string = "fsdsd";
  timeLeft: string = "";
  date: string = "";

  constructor(
    public themeService: ThemeService,
    public navbarService: NavbarService,
    private route: ActivatedRoute,
    private router: Router,
    private fixtureTransferService: FixtureTransferService,
    private authService: AuthService,
    private apiService: ApiService,
    private betsService: BetsService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  // async updateTheTime() {
  //   this.time = this.formatDateToHHMM(this.fixture.time);
  //   this.cdr.detectChanges();
  // }
  async updateTheTime() {
    this.time = this.convertToLocaleTimeString(this.fixture.time);
    this.timeLeft = this.convertDate(this.fixture.time);
    this.date = this.convertToLocalReadableDateString(this.fixture.time);
    this.cdr.detectChanges();
  }
  ngOnInit(): void {
    this.navbarService.setShowNavbar(true);
    this.route.paramMap.subscribe((params) => {
      const id = +params.get("id")!;
      this.fixtureTransferService.currentFixture.subscribe((fixture) => {
        if (fixture?.fixtureID === id) {
          this.fixture = fixture;
          this.updateTheTime();
        } else {
          // this.fetchFixture(id).then(() => this.updateTheTime());
          this.fetchFixture(id);
          this.updateTheTime();
        }
      });
    });
    this.time = "test";
    // this.fetchLineup(this.fixture.fixtureID);
    // this.initializeLineups();
    this.updateTheTime();
    this.getUserCredits();
    this.checkIfBetCanBePlaced();
  }

  checkIfBetCanBePlaced() {
    let fixtureTimeUTC0 = new Date(this.fixture.time);
    // Convert fixture time to UTC+1
    let fixtureTimeUTC1 = new Date(
      fixtureTimeUTC0.getTime() + (60 * 60 * 1000),
    );
    let currentTimeUTC1 = new Date(new Date().getTime() + (60 * 60 * 1000));
    this.betCanBePlaced = currentTimeUTC1 < fixtureTimeUTC1;
  }

  async fetchFixture(fixtureID: number) {
    const data = await this.apiService.fetchSingleSupabaseFixture(fixtureID);
    this.fixture = data; // Ensure that this.fixture is updated with the fetched data
    // this.time = this.formatDateToHHMM(this.fixture.time);
  }

  setMinBetAmount() {
    this.betAmount = 50;
  }

  setMaxBetAmount() {
    this.betAmount = this.availableCredits;
  }

  addAmount(number: number) {
    if (
      this.betAmount + number > 0 &&
      this.betAmount + number <= this.availableCredits
    ) {
      this.betAmount += number;
    }
  }

  async getUserCredits() {
    const user = this.authService.session?.user;
    this.availableCredits = await this.betsService.getUserCredits(user?.id!);
  }

  private initializeLineups(): void {
    // Initialize lineupHome and lineupAway with empty arrays for each position
    for (let i = 0; i <= 5; i++) {
      this.lineupHome[i] = [];
      this.lineupAway[i] = [];
    }
  }

  // getBetterID(): number {
  //     const user = this.authService.session?.user;
  //     if(this.betsService.checkIfUserIsRegistered(user.id)){}
  // }
  async getBetterID(): Promise<number> {
    const user = this.authService.session?.user;
    if (user) {
      const isRegistered = await this.betsService.checkIfUserIsRegistered(
        user.id,
      );
      if (isRegistered) {
        return this.betsService.getBetterID(user.id);
      } else {
        await this.betsService.createBetter(user.id);
        return this.betsService.getBetterID(user.id);
      }
    }
    throw new Error("User is not registered or session is not available");
  }

  async testInput() {
    const betterID = await this.getBetterID();
    console.log(this.teamToWin);
    if (this.teamToWin) {
      console.log("team2");
    } else {
      console.log("team1");
    }
  }

  async placeBet() {
    const user = this.authService.session?.user;
    const betterID = await this.getBetterID();
    if (!user || !user.id) throw new Error("User ID is undefined");
    const bet: Bet = {
      betterID: betterID,
      fixtureID: this.fixture.fixtureID,
      time_placed: new Date(),
      team_chosen: this.teamChosen!,
      credits: this.betAmount,
    };
    const checkIfBetExists = await this.betsService.checkIfBetExists(
      bet.betterID,
      this.fixture.fixtureID,
    );
    if (!checkIfBetExists) {
      const betCreated = await this.betsService.createBet(bet, user.id);
      if (betCreated) {
        console.log("Bet created");
      } else {
        throw new Error("Error creating bet");
      }
    } else {
      this.handleBetAlreadyExists();
      throw new Error("Bet already exists");
    }
  }

  handleBetAlreadyExists() {
    //something needs to be done here
  }

  categorizePlayers(): void {
    this.initializeLineups();

    this.lineups.forEach((lineup, index) => {
      // Determine if it's the home or away lineup
      const currentLineup = index === 0 ? this.lineupHome : this.lineupAway;

      // Parse formation to get the count of players in each category
      const formationParts = [1, ...lineup.formation.split("-").map(Number)]; // Prepend '1' for the goalkeeper
      if (formationParts.length < 3 || formationParts.length > 6) {
        throw new Error(
          "Invalid formation. Formation should have 2 to 5 parts, plus the goalkeeper.",
        );
      }

      // Reset current lineup
      Object.keys(currentLineup).forEach((key) =>
        currentLineup[Number(key)] = []
      );

      // Assign players to their positions based on formation
      let positionIndex = 0;
      lineup.startXI.forEach((player) => {
        if (
          currentLineup[positionIndex].length >= formationParts[positionIndex]
        ) {
          positionIndex++;
        }

        if (positionIndex < formationParts.length) {
          currentLineup[positionIndex].push({
            name: player.player.name,
            number: player.player.number,
          });
        } else {
          console.warn(`Extra player in formation: ${player.player.name}`);
        }
      });
    });
  }

  logData() {
    console.log(this.lineupHome);
  }

  convertToLocaleTimeString(dateString: string): string {
    if (this.fixture.is_finished) {
      return `${this.fixture.home_goals} - ${this.fixture.away_goals}`;
    } else if (this.fixture.is_finished == false) {
      return "LIVE";
    } else {
      // Parse the date string into a Date object
      const date = new Date(dateString);

      // Define options for the time format
      const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true, // Use 12-hour format
      };

      // Use Intl.DateTimeFormat to format the time according to local timezone
      return new Intl.DateTimeFormat("en-US", options).format(date);
    }
  }

  convertToLocalReadableDateString(dateString: string): string {
    // Parse the date string into a Date object
    const date = new Date(dateString);

    // Define options for the date and time format
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    };

    // Use Intl.DateTimeFormat to format the date and time according to local timezone
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  convertDate(dateString: string): string {
    if (this.fixture.is_finished) {
      return "FT";
    }

    const matchDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Resetting the time part of the dates for accurate comparison
    today.setHours(0, 0, 0, 0);
    matchDate.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (matchDate.getTime() === today.getTime()) {
      return "today";
    } else if (matchDate.getTime() === tomorrow.getTime()) {
      return "tomorrow";
    } else {
      const diffTime = Math.abs(matchDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + " days";
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleContent(team: string) {
    if (this.clickedImage === team) {
      // If the same team is clicked again, reset everything
      this.showContent = false;
      this.clickedImage = null;
      this.teamToWin = null; // Reset teamToWin as well
    } else {
      // Otherwise, show content and set the clicked team
      this.showContent = true;
      this.clickedImage = team;
      if (team === "team1") {
        this.teamToWin = true;
      } else if (team === "team2") {
        this.teamToWin = false;
      }
    }
  }
}
