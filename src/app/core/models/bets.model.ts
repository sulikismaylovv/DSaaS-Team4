export interface Bet {
    id?: number;
    betterID: number;
    fixtureID: number;
    time_placed: Date;
    team_chosen: boolean;
    credits: number;
    outcome?: boolean;
    time_settled?: Date;
}

export interface Better{
  betterID?: number; //autoincremented by supabase
  userID: number; //foreign key to users table
  credits: number;
  activeCredits: number; //credits that are currently in bets
}

export class Bets {
}
