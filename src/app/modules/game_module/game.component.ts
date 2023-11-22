import { Component, OnInit } from '@angular/core';
import { ThemeService } from "../../core/services/theme.service";
import { Fixture, FixtureModel } from 'src/app/core/models/fixtures.model';
import { DatePipe } from '@angular/common';
import { NavbarService } from "../../core/services/navbar.service";
import { Router, ActivatedRoute } from '@angular/router';
import { FixtureTransferService } from '../../core/services/fixture-transfer.service';
import { Lineup, LineupModel } from 'src/app/core/models/lineup.model';
import { ApiService } from 'src/app/core/services/api.service';
import { LineupComponent } from './lineup/lineup.component';
import { groupBy } from 'lodash';
import { BetModel } from 'src/app/core/models/bets.model';
import { Bet } from 'src/app/core/models/bets.model';
import { BetsService } from 'src/app/core/services/bets.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [DatePipe]
})
export class GameComponent implements OnInit {
    showContent: boolean = false;
    clickedImage: string | null = null;
    fixture: Fixture = new FixtureModel();
    lineups: Lineup[] = [];
    lineupHome: { [key: number]: { name: string, number: number }[] } = {};
    lineupAway: { [key: number]: { name: string, number: number }[] } = {};
    isLoading: boolean = true;
    // bet: BetModel = null!;
    credits: number = 0;
    teamToWin: boolean | null = null;

    constructor(
        public themeService: ThemeService,
        public navbarService: NavbarService,
        private route: ActivatedRoute,
        private router: Router,
        private fixtureTransferService: FixtureTransferService,
        private authService: AuthService,
        private apiService: ApiService,
        private betsService: BetsService) {
    }

    ngOnInit(): void {
        this.navbarService.setShowNavbar(true);
        this.route.paramMap.subscribe(params => {
            const id = +params.get('id')!;
            this.fixtureTransferService.currentFixture.subscribe(fixture => {
                if (fixture?.fixture.id === id) {
                    this.fixture = fixture;
                }
            });
        });
        this.fetchLineup(this.fixture.fixture.id);
        this.initializeLineups();
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
            const isRegistered = await this.betsService.checkIfUserIsRegistered(user.id);
            if (isRegistered) {
                return this.betsService.getBetterID(user.id);
            } else {
                await this.betsService.createBetter(user.id);
                return this.betsService.getBetterID(user.id);
            }
        }
        throw new Error('User is not registered or session is not available');
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
        if (!user || !user.id) throw new Error('User ID is undefined');
        const bet: Bet = {
            betterID: betterID,
            fixtureID: this.fixture.fixture.id,
            time_placed: new Date(),
            team_chosen: true,
            credits: this.credits
        }
        const checkIfBetExists = await this.betsService.checkIfBetExists(bet.betterID, this.fixture.fixture.id);
        if (!checkIfBetExists) {
            const betCreated = await this.betsService.createBet(bet, user.id);
            if (betCreated) {
                console.log("Bet created");
            } else {
                throw new Error('Error creating bet');
            }

        } else {
            throw new Error('Bet already exists');
        }
    }

    categorizePlayers(): void {
        // Initialize lineups
        this.initializeLineups();

        this.lineups.forEach((lineup, index) => {
            // Determine if it's the home or away lineup
            const currentLineup = index === 0 ? this.lineupHome : this.lineupAway;

            // Parse formation to get the count of players in each category
            const formationParts = [1, ...lineup.formation.split('-').map(Number)]; // Prepend '1' for the goalkeeper
            if (formationParts.length < 3 || formationParts.length > 6) {
                throw new Error('Invalid formation. Formation should have 2 to 5 parts, plus the goalkeeper.');
            }

            // Reset current lineup
            Object.keys(currentLineup).forEach(key => currentLineup[Number(key)] = []);

            // Assign players to their positions based on formation
            let positionIndex = 0;
            lineup.startXI.forEach(player => {
                if (currentLineup[positionIndex].length >= formationParts[positionIndex]) {
                    positionIndex++;
                }

                if (positionIndex < formationParts.length) {
                    currentLineup[positionIndex].push({ name: player.player.name, number: player.player.number });
                } else {
                    console.warn(`Extra player in formation: ${player.player.name}`);
                }
            });
        });
    }


    logData() {
        console.log(this.lineupHome);
    }


    fetchLineup(fixtureID: number) {
        this.apiService.fetchLineups(fixtureID).subscribe({

            next: (data: Lineup[]) => {
                this.lineups = data;
                this.initializeLineups(); // Initialize lineups before categorizing players
                this.categorizePlayers();   // Categorize players after lineups data is fetched
                this.isLoading = false;
            },
            error: (error) => {
                console.log(error);
            }
        })
    };

    //convert from type Date to type string YYYY-MM-DD
    getDateAsString(date: Date): string {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().split('T')[0];
    }


    //convert from type string YYYY-MM-DD to type string MMM d
    formatShortDateString(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

            if (team === 'team1') {
                this.teamToWin = true;
            } else if (team === 'team2') {
                this.teamToWin = false;
            }
        }
    }
}
