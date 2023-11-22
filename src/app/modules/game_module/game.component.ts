import {Component, OnInit} from '@angular/core';
import {ThemeService} from "../../core/services/theme.service";
import {ApiService} from "../../core/services/api.service";
import {compareAsc, endOfWeek, format, parseISO, startOfWeek} from 'date-fns';
import {groupBy} from 'lodash';
import {Fixture} from 'src/app/core/models/fixtures.model';
import {DatePipe} from '@angular/common';
import {NavbarService} from "../../core/services/navbar.service";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [DatePipe]
})
export class GameComponent implements OnInit {
    showContent: boolean = false;
    clickedImage: string | null = null;
    fixtures: Fixture[] = [];
    groupedFixtures: { [key: string]: Fixture[] } = {};  //grouped by date
    groupedFixtureKeys: string[] = [];
    currentDate: Date;
    startDate: Date = new Date("2023-11-12");
    endDate: Date = new Date();
    stringDate: string;
    currentFixture: Fixture = {} as Fixture;

    constructor(
        public themeService: ThemeService,
        public apiService: ApiService,
        private datePipe: DatePipe,
        public navbarService: NavbarService) {
        this.currentDate = new Date("2023-11-12"); //use this for today's date
        this.stringDate = this.currentDate.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        // this.setWeek(new Date());
        // this.fetchFixturesForWeek();
        this.navbarService.setShowNavbar(true);
        this.parseFixtures(144);
    }


    parseFixtures(leagueID: number) {
        let dateString = "2023-11-12";
        console.log(dateString);
        this.apiService.fetchFixtures(leagueID, dateString).subscribe(
            (data: Fixture[]) => {
                this.fixtures = data;
                console.log(this.fixtures)
            })
        let currentFixture = this.fixtures[0];
    }

    logData() {
        console.log("logging data");
        console.log(this.groupedFixtures);
        console.log(this.fixtures);
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

    setWeek(date: Date) {
        this.startDate = startOfWeek(date, {weekStartsOn: 5});
        this.endDate = endOfWeek(date, {weekStartsOn: 5});
    }

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
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    }

    getGroupedFixtureKeys(): string[] {
        return Object.keys(this.groupedFixtures);
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
