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

    constructor(
        public themeService: ThemeService,
        public navbarService: NavbarService,
        private route: ActivatedRoute,
        private router: Router,
        private fixtureTransferService: FixtureTransferService,
        private ApiService: ApiService) {
    }

    ngOnInit(): void {
        this.navbarService.setShowNavbar(true);
        // const navigation = this.router.getCurrentNavigation();
        // this.fixture = navigation?.extras.state?.fixture;    
        this.route.paramMap.subscribe(params => {
            const id = +params.get('id')!;
            this.fixtureTransferService.currentFixture.subscribe(fixture => {
              if (fixture?.fixture.id === id) {
                this.fixture = fixture;
              }
            });
          });
        this.fetchLineup(this.fixture.fixture.id);
    }
    logData() {
        console.log(this.lineups[0].coach.name);
    }

    getPlayerStyle(grid: string) {
        const [x, y] = grid.split(':').map(Number);
        // Convert grid positions to percentages (adjust based on your field image size)
        return {
          'left': `${(y / 5) * 100}%`, // Assuming 5 columns
          'top': `${(x / 5) * 100}%` // Assuming 5 rows
        };
      }

    fetchLineup(fixtureID: number) {
        this.ApiService.fetchLineups(fixtureID).subscribe(
            (data: Lineup[]) => {
                this.lineups = data;
            }
        );
    }

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
        } else {
            // Otherwise, show content and set the clicked team
            this.showContent = true;
            this.clickedImage = team;
        }
    }
}
