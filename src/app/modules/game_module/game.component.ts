import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ThemeService } from "../../core/services/theme.service";
import { DatePipe } from "@angular/common";
import { NavbarService } from "../../core/services/navbar.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FixtureTransferService } from "../../core/services/fixture-transfer.service";
import { Lineup } from "src/app/core/models/lineup.model";
import { ApiService } from "src/app/core/services/api.service";
import { Bet } from "src/app/core/models/bets.model";
import { BetsService } from "src/app/core/services/bets.service";
import { AuthService } from "src/app/core/services/auth.service";
import { Club } from "src/app/core/models/club.model";
import {
  SupabaseFixture,
  SupabaseFixtureModel,
} from "src/app/core/models/supabase-fixtures.model";
import { SupabaseService } from "src/app/core/services/supabase.service";
import { Observable } from "rxjs";
import { from } from "rxjs";
import { Player } from "src/app/core/models/player.model";
declare let gtag: Function;

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
  providers: [DatePipe],
})
export class GameComponent implements OnInit {
  loading = true;
  showContent = false;
  clickedImage: string | null = null;
  fixture: SupabaseFixture = new SupabaseFixtureModel();
  lineups: Lineup[] = [];
  isLoading = true;
  // bet: BetModel = null!;
  teamChosen = "";
  betAmount = 200;
  availableCredits = 0;
  betCanBePlaced = true;
  league: Club[] = [];
  showNewContent = false;
  credits = 100;
  testingdata: any;
  betAlreadyPlaced = false;
  isLineupAvailable = false;
  betInfo$: Observable<{ betAmount: number; teamChosen: string }> =
    new Observable<{ betAmount: number; teamChosen: string }>();
  squadHome: Player[] = [];
  squadAway: Player[] = [];
  lineupHome: Player[] = [];
  lineupAway: Player[] = [];

  time = "";
  timeLeft = "";
  date = "";

  //
  jupilerProLeagueColors: { [id: string]: string } = {
    '740': 'rgb(223, 23, 43)', // Antwerp: Red
    '742': 'rgb(0, 77, 157)', // Genk: Blue
    '569': 'rgb(0, 120, 187)', // Club Brugge KV: Blue
    '741': 'rgb(0, 215, 25)', // Cercle Brugge: Green
    '735': 'rgb(245, 209, 40)', // St. Truiden: Yellow
    '733': 'rgb(152, 131, 68)', // Standard Liege: Red
    '266': 'rgb(255, 229, 0)', // KV Mechelen: Yellow
    '6224': 'rgb(238, 50, 36)', // RWDM: Black
    '736': 'rgb(255, 230, 0)', // Charleroi: Black
    '739': 'rgb(0, 0, 0)', // AS Eupen: Black
    '260': 'rgb(255, 255, 255)', // OH Leuven: White
    '734': 'rgb(200, 16, 46)', // Kortrijk: Red
    '1393': 'rgb(246, 211, 48)', // Union St. Gilloise: Yellow
    '554': 'rgb(81, 46, 143)', // Anderlecht: Purple
    '261': 'rgb(42, 102, 157)', // KVC Westerlo: Red
    '631': 'rgb(0, 71, 148)', // KAA Gent: Blue
  };

  idTeam0: number = 0;
  idTeam1: number = 0;
  oddHome: number = 0;
  oddAway: number = 0;

  constructor(
    public themeService: ThemeService,
    public navbarService: NavbarService,
    private route: ActivatedRoute,
    private router: Router,
    private fixtureTransferService: FixtureTransferService,
    protected authService: AuthService,
    private apiService: ApiService,
    private betsService: BetsService,
    private cdr: ChangeDetectorRef,
    private readonly supabase: SupabaseService,
  ) {
    this.supabase.supabaseClient.channel("realtime-bettingrecord")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bettingrecord",
      }, async () => {
        // this.testingdata = payload.old['credits'];
        // const betterID = (payload.new as { betterID: number }).betterID;
        // const fixtureID = (payload.new as { fixtureID: number }).fixtureID;
        // const credits = (payload.new as { credits: number }).credits;
        // const betExists =  await this.betsService.checkIfBetExists(betterID,fixtureID);
        // if(betExists) {
        //   this.betCanBePlaced=false;
        //   this.credits -= credits;
        // } else this.betCanBePlaced=true;
        //console.log("betAlreadyPlaced before update: ", this.betAlreadyPlaced);
        if(this.authService.isLogged()){
        this.betAlreadyPlaced = await this.betsService.checkIfBetExists(
          await this.getBetterID(),
          this.fixture.fixtureID,
        );
        console.log("betAlreadyPlaced before update: ", this.betAlreadyPlaced);
        this.cdr.detectChanges();
        if (this.betAlreadyPlaced && this.authService.isLogged()) {
          //console.log("getBetInfo() called");
          this.getBetInfo();
          this.availableCredits = await this.betsService.getUserCredits(this.authService.session?.user?.id!);
        }
      }}).subscribe();
  }

  async checkCredits(): Promise<void> {
    await this.checkIfLoggedIn();
    console.log(this.betAmount + " and " + this.availableCredits);
    if (this.availableCredits < this.betAmount) {
      this.openModal("insufficientCredits");
    }
  }

  openModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
    }
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
    this.loading = true;
    this.route.paramMap.subscribe((params) => {
      const id = +params.get("id")!;
      this.fixtureTransferService.currentFixture.subscribe(async (fixture) => {
        if (fixture?.fixtureID === id) {

          this.idTeam0 = this.fixture.club0?.id as number;
          this.idTeam1 = this.fixture.club1?.id as number;


          this.fixture = fixture;
          const squadPromise = await this.fetchSquads();
          const timePromise = await this.updateTheTime();
          if(this.authService.isLogged()){
          const checkPromise = await this.checkIfBetCanBePlaced();

          await Promise.all([squadPromise, timePromise, checkPromise]);}

          await Promise.all([squadPromise, timePromise]);
          this.loading = false;

          if (this.betAlreadyPlaced && this.authService.isLogged()) {
            this.getBetInfo().then(() => this.logData());
          }
        } else {
          await this.fetchFixture(id);
        }

        this.navbarService.setShowNavbar(true);
        this.time = "test";

        this.oddHome = this.fixture.odds_home ?? 0;
        this.oddAway = this.fixture.odds_away ?? 0;
        await this.updateTheTime();
        (async () => await this.updateTheTime());
        // this.fetchLineup(this.fixture.fixtureID);
        // this.initializeLineups();
        if(this.authService.isLogged()){
        await this.getUserCredits();}
        await this.getStanding();
      });
    });
  }
  goBack() {
    this.router.navigate(['/home']).then(r => console.log("back"));
  }
  async getBetInfo() {
    const user = this.authService.session?.user;
    if (user) {
      const betterID = await this.betsService.getBetterID(user.id);
      const bet = await this.betsService.fetchBetInfo(
        betterID,
        this.fixture.fixtureID,
      );
      this.betAmount = bet.credits;
      this.teamChosen = bet.team_chosen;
    }
    this.cdr.detectChanges();
  }

  async fetchSquads() {

    this.idTeam0 = this.fixture.club0?.id as number;
    this.idTeam1 = this.fixture.club1?.id as number;

    this.squadHome = await this.apiService.fetchSquad(this.idTeam0);
    this.squadAway = await this.apiService.fetchSquad(this.idTeam1);

    await this.fetchLineups();
    this.cdr.detectChanges();
  }

  async fetchLineups() { //if its there
    // const numbers = this.fixture.lineups?.split("|");
    // console.log("numbers: ", numbers);
    // console.log("fixture.lineups: ", this.fixture.lineups);
    const numbersRaw = await this.apiService.fetchLineup(this.fixture.fixtureID);
    if (numbersRaw === null) {
      this.isLineupAvailable = false;
      //console.log("Lineup is not available");
      return;
    }
    this.isLineupAvailable = true;
    const numbers = numbersRaw.split("|");
    //console.log("numbers: ", numbers);
    const listHome = numbers[0].split(",").map(Number);
    const listAway = numbers[1].split(",").map(Number);

    for (const playerId of listHome) {
      const player = this.squadHome.find(p => p.id === playerId);
      if (player) {
        this.lineupHome.push(player);
      }
    }
    for (const playerId of listAway) {
      const player = this.squadAway.find(p => p.id === playerId);
      if (player) {
        this.lineupAway.push(player);
      }
    }
    this.cdr.detectChanges();

  }

  fetchBetInfoObservable(betterID: number, fixtureID: number): Observable<Bet> {
    return from(this.betsService.fetchBetInfo(betterID, fixtureID));
  }

  logData() {
    console.log("homeSquad: ", this.squadHome);
    console.log("awaySquad: ", this.squadAway);
    console.log("home: ", this.lineupHome);
    console.log("away: ", this.lineupAway);
  }

  async checkIfBetCanBePlaced() {
    const fixtureTimeUTC0 = new Date(this.fixture.time);
    // Convert fixture time to UTC+1
    const fixtureTimeUTC1 = new Date(
      fixtureTimeUTC0.getTime() + (60 * 60 * 1000),
    );
    const currentTimeUTC1 = new Date(new Date().getTime() + (60 * 60 * 1000));
    this.betCanBePlaced = currentTimeUTC1 < fixtureTimeUTC1;
    this.betAlreadyPlaced = await this.betsService.checkIfBetExists(
      await this.getBetterID(),
      this.fixture.fixtureID,
    );
    if (this.betAlreadyPlaced && this.authService.isLogged()) {
      console.log("getBetInfo() called");
      this.getBetInfo();
    }
  }

  async fetchFixture(fixtureID: number) {
    const data = await this.apiService.fetchSingleSupabaseFixture(fixtureID);
    console.log("fetchFixture() called");
    console.log("date.time: ", data.time);
    this.fixture = data; // Ensure that this.fixture is updated with the fetched data
    await this.fetchSquads();
    await this.fetchLineups();
    await this.updateTheTime();
    this.checkIfBetCanBePlaced();

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
      console.log(this.betAmount);
    }
    this.trackButtonClick1();
  }

  async getUserCredits() {
    const userId = this.authService.session?.user?.id;
    if (userId) {
      this.availableCredits = await this.betsService.getUserCredits(userId);
    } else {
      console.log("User not logged in");
    }
  }

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

  async getStanding() {
    const data = await this.apiService.fetchStandings();
    this.league = data;
  }

  async placeBet() {
    await this.checkIfLoggedIn();
    console.log("placeBet() called");
    const user = this.authService.session?.user;
    const betterID = await this.getBetterID();
    if (!user || !user.id) throw new Error("User ID is undefined");
    const bet: Bet = {
      betterID: betterID,
      fixtureID: this.fixture.fixtureID,
      time_placed: new Date(),
      team_chosen: this.teamChosen,
      credits: this.betAmount,
    };
    const checkIfBetExists = await this.betsService.checkIfBetExists(
      bet.betterID,
      this.fixture.fixtureID,
    );
    if (!checkIfBetExists && this.betCanBePlaced) {
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
    this.trackButtonClick();
  }


  handleBetAlreadyExists() {
    //something needs to be done here
  }

  hasFixtureTimePassed(): boolean {
    const fixtureDate = new Date(this.fixture.time);
    const currentDate = new Date();
    return currentDate > fixtureDate;
  }

  convertToLocaleTimeString(dateString: string): string {

    if (this.fixture.is_finished || this.hasFixtureTimePassed()) {
      return `${this.fixture.home_goals} - ${this.fixture.away_goals}`;
    }
    //  else if (this.fixture.is_finished == false && this.hasFixtureTimePassed()) {
    //   return "LIVE";}
    else {
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

    if (this.fixture.is_finished == false && this.hasFixtureTimePassed()) {
      return "LIVE";
    }
    else
      if (matchDate.getTime() === today.getTime()) {
        return "Today";
      } else if (matchDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else {
        const diffTime = Math.abs(matchDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + " days";
      }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
  goToShop() {
    this.router.navigate(["/shop"]);
  }
  toggleContent(team: string) {
    if (this.clickedImage === team) {
      // If the same team is clicked again, reset everything
      this.showContent = false;
      this.clickedImage = null;
      this.teamChosen = ""; // Reset teamToWin as well
    } else {
      // Otherwise, show content and set the clicked team
      this.showContent = true;
      this.clickedImage = team;
      if (team === "team1") {
        this.teamChosen = "home";
        this.trackButtonClick2();
      } else if (team === "team2") {
        this.teamChosen = "away";
        this.trackButtonClick3();
      } else if (team === "draw") {
        this.teamChosen = "draw";
        this.trackButtonClick4();

      }
    }
  }

  toggleNewContent() {
    this.showNewContent = true;
  }

  trackButtonClick(): void {
    console.log("success", "hey");
    gtag('event', 'Bet', {
      event_category: 'Button1',
      event_label: 'BetButton'
    });
  }
  trackButtonClick1(): void {
    console.log("success1", "hey1");
    gtag('event', 'ChangeBetValue', {
      event_category: 'Button2',
      event_label: 'ChangeButton'
    });
  }

  trackButtonClick2(): void {
    console.log("success", "hey");
    gtag('event', 'Team1', {
      event_category: 'Button3',
      event_label: 'TeamButton1'
    });
  }
  trackButtonClick3(): void {
    console.log("success1", "hey1");
    gtag('event', 'Team2', {
      event_category: 'Button4',
      event_label: 'TeamButton2'
    });
  }
  trackButtonClick4(): void {
    console.log("success1", "hey1");
    gtag('event', 'Draw', {
      event_category: 'Button5',
      event_label: 'DrawButton'
    });
  }


  async checkIfLoggedIn() {
    if (!this.authService.isLogged()) {
      await this.router.navigate(["/login"]);
    }
  }
}
