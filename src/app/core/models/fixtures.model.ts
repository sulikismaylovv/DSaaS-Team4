export interface Fixture {
    fixture: fixtureInfo;
    league: league;
    teams: Teams;
    goals: Goals;
    score: Score;
}

export interface fixtureInfo {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
}

export interface league {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
}

export interface home {
    id: number;
    name: string;
    logo: string;
    winner: boolean;
}

export interface away {
    id: number;
    name: string;
    logo: string;
    winner: boolean;
}

export interface Teams {
    home: home;
    away: away;
}

export interface Goals {
    home: number | null
    away: number | null;
}

export interface Score {
    halftime: Goals;
    fulltime: Goals;
    extratime: Goals;
    penalty: Goals;
}

export class FixtureModel implements Fixture {
    fixture: fixtureInfo;
    league: league;
    teams: Teams;
    goals: Goals;
    score: Score;

    constructor() {
        // Initialize properties with default values
        this.fixture = {
            id: 0,
            referee: '',
            timezone: '',
            date: '',
            timestamp: 0
        };
        this.league = {
            id: 0,
            name: '',
            country: '',
            logo: '',
            flag: '',
            season: 0,
            round: ''
        };
        this.teams = {
            home: {
                id: 0,
                name: '',
                logo: '',
                winner: false
            },
            away: {
                id: 0,
                name: '',
                logo: '',
                winner: false
            }
        };

        this.goals = {
            home: null,
            away: null
        };

        this.score = { // Initialize score with objects of type Goals
            halftime: {home: null, away: null},
            fulltime: {home: null, away: null},
            extratime: {home: null, away: null}, // Assuming null is a valid value
            penalty: {home: null, away: null} // Assuming null is a valid value
        };
    }
}
