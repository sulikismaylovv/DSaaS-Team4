export interface SupabaseFixture {
    fixtureID: number;
    team0: number;
    team1: number;
    time: Date;
    venue: string;
    is_finished: boolean;
    winner?: boolean;
    home_goals?: number;
    away_goals?: number;
    final_score?: string;
    lineups?: string;
    odds_home?: number;
    odds_away?: number;
    odds_draw?: number;
    referee?: string;
    club0?: club;
    club1?: club;
}

interface club {
    id: number;
    name: string;
    logo: string;
}
export class SupabaseFixtures {
}
