export interface FixtureInfo {
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

export interface Teams{
    home: home;
    away: away;
}

export interface Goals {
    home: number;
    away: number;
}

export interface Score {
    halftime: Goals;
    fulltime: Goals;
    extratime: Goals;
    penalty: Goals;
}

export interface Fixture {
    fixture: Fixture;
    league: league;
    teams: Teams;
    goals: Score;
    score: Score;
}