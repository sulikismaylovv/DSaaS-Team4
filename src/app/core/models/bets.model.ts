export interface Bet {
  id?: number;
  betterID: number;
  fixtureID: number;
  time_placed: Date;
  team_chosen: string;
  credits: number;
  outcome?: boolean;
  time_settled?: Date;
}

export interface Better{
  betterID?: number; //autoincremented by supabase
  userID: string; //foreign key to users table
  credits: number;
  activeCredits: number; //credits that are currently in bets
  xp: number;
}

export class BetModel implements Bet{
  betterID: number;
  fixtureID: number;
  time_placed: Date;
  team_chosen: string;
  credits: number;
  outcome?: boolean;
  time_settled?: Date;

  constructor(betterID: number, fixtureID: number, time_placed: Date, team_chosen: string, credits: number) {
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
  xp: number;

  constructor(userID: string, credits: number, activeCredits: number, xp: number) {
    this.userID = userID;
    this.credits = credits;
    this.activeCredits = activeCredits;
    this.xp = xp;
  }
}

export class Bets {
}
