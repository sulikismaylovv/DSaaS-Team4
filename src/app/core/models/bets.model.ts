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
  userID: string; //foreign key to users table
  credits: number;
  activeCredits: number; //credits that are currently in bets
}

export class BetModel implements Bet{
  betterID: number;
  fixtureID: number;
  time_placed: Date;
  team_chosen: boolean;
  credits: number;
  outcome?: boolean;
  time_settled?: Date;

  constructor(betterID: number, fixtureID: number, time_placed: Date, team_chosen: boolean, credits: number) {
    this.betterID = betterID;
    this.fixtureID = fixtureID;
    this.time_placed = time_placed;
    this.team_chosen = team_chosen;
    this.credits = credits;
  }
}

export class BetterModel implements Better{
  betterID?: number;
  userID: string;
  credits: number;
  activeCredits: number;

  constructor(userID: string, credits: number, activeCredits: number) {
    this.userID = userID;
    this.credits = credits;
    this.activeCredits = activeCredits;
  }
}
