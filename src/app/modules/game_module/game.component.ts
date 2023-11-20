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
    isLoading: boolean = true;
    viewBox = '0 0 100 100';
    scaleFactor = 10;

    public gridToCoordinates(grid: string, formation: string): { x: number, y: number } {
        const [x, y] = grid.split(':').map(Number);

        // You need to determine the number of columns based on the formation
        const columns = this.getColumnsFromFormation(formation);

        // Centering adjustment: calculate the offset needed to center the formation
        const xCenterOffset = (this.maxColumnsInFormation - columns) / 2;
        const yBase = 10; // Base Y position to start plotting from the bottom of the field

        // Assuming your SVG's width and height are 100 units
        const svgCenterX = 50;
        const svgCenterY = 50;

        return {
            x: (x + xCenterOffset) * (100 / this.maxColumnsInFormation) + svgCenterX - (columns / 2 * this.scaleFactor),
            y: svgCenterY + (y - yBase) * this.scaleFactor
        };
    }

    private get maxColumnsInFormation(): number {
        // Get the largest number of columns from all the lineups
        return Math.max(...this.lineups.map(l => this.getColumnsFromFormation(l.formation)));
    }

    private getColumnsFromFormation(formation: string): number {
        // Split the formation by '-' and get the largest number as that will be the max columns
        const parts = formation.split('-').map(Number);
        return Math.max(...parts);
    }

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
        console.log(this.lineups[0].startXI[2].player.number);
    }



    // getPlayerStyle(grid: string) {
    //     const [x, y] = grid.split(':').map(Number);
    //     // Convert grid positions to percentages (adjust based on your field image size)
    //     return {
    //         'left': `${(y / 5) * 100}%`, // Assuming 5 columns
    //         'top': `${(x / 5) * 100}%` // Assuming 5 rows
    //     };
    // }

    fetchLineup(fixtureID: number) {
        this.ApiService.fetchLineups(fixtureID).subscribe({

            next: (data: Lineup[]) => {
                this.lineups = data;
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
        } else {
            // Otherwise, show content and set the clicked team
            this.showContent = true;
            this.clickedImage = team;
        }
    }
}
