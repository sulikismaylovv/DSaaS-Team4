import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Bet, Better } from '../models/bets.model';
import {Fixture,fixtureInfo} from "../models/fixtures.model";
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import {Club} from "../models/club.model";

export interface BetWithFixture {
  bet: Bet;
  fixture: Fixture;
  team0_details: Club;
  team1_details: Club;
}
@Injectable({
  providedIn: 'root'
})
export class BetsService {

  constructor(private supabase: SupabaseService) {
  }

  async createBet(bet: Bet, userID: string) {
    try {
      // Check if user is registered and retrieve the betterID
      const {data: userData, error: userError} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('betterID')
        .eq('userID', userID)
        .single();

      if (userError) throw userError;
      if (!userData) {
        console.error('User not found');
        return false; // Or handle unregistered user scenario
      }

      // Now we have the betterID
      const betterID = userData.betterID;

      // Check if user can afford the bet
      if (!(await this.checkIfUserAffordsBet(userID, bet.credits))) {
        console.error('User does not have enough credits');
        return false; // Or handle this scenario appropriately
      }

      // Set the betterID in the bet object
      bet.betterID = betterID;

      // Create the bet in bettingrecord
      const {error: betError} = await this.supabase.supabaseClient
        .from('bettingrecord')
        .insert([bet]);
      if (betError) throw betError;

      // Update user's credits
      await this.updateCredits(userID, bet.credits);

      return true;
    } catch (error) {
      console.error('Error creating bet:', error);
      throw error;
    }
  }


  async checkIfBetExists(betterID: number, fixtureID: number): Promise<boolean> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('bettingrecord')
        .select('*')
        .eq('betterID', betterID)
        .eq('fixtureID', fixtureID);
      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      console.error('Error fetching bets:', error);
      throw error;
    }
  }

  async fetchBetInfo(betterID: number, fixtureID: number): Promise<Bet> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('bettingrecord')
        .select('*')
        .eq('betterID', betterID)
        .eq('fixtureID', fixtureID);
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error fetching bets:', error);
      throw error;
    }
  }

  async checkIfUserAffordsBet(userID: string, credits: number): Promise<boolean> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('credits')
        .eq('userID', userID)
        .single();
      // Check for errors
      if (error) {
        console.error('Error fetching user credits:', error);
        throw error;
      }

      if (!data) {
        console.error('No user found');
        return false;
      }

      return data.credits >= credits;
    } catch (err) {
      console.error('Error checking user credits:', err);
      return false;
    }
  }

  async updateCredits(userID: string, creditsOffset: number): Promise<boolean> {
    try {
      // Fetch current credits and activeCredits
      const {data: currentData, error: fetchError} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('credits, activeCredits')
        .eq('userID', userID)
        .single();

      if (fetchError) throw fetchError;
      if (!currentData) {
        console.error('User not found');
        return false;
      }

      // Calculate new values
      const newCredits = currentData.credits - creditsOffset;
      const newActiveCredits = currentData.activeCredits + creditsOffset;

      console.log('New credits:', newCredits);

      // Update both credits and activeCredits
      const {data: updateData, error: updateError} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .update({credits: newCredits, activeCredits: newActiveCredits})
        .eq('userID', userID);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error updating user credits:', error);
      throw error;
    }
  }

  async checkIfUserIsRegistered(userID: string): Promise<boolean> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('userID')
        .eq('userID', userID);
      if (error) throw error;
      return data.length > 0;

    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getBetterID(userID: string): Promise<number> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('betterID')
        .eq('userID', userID)
        .single();
      if (error) throw error;
      if (data) {
        return data.betterID;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserCredits(userID: string): Promise<number> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('credits')
        .eq('userID', userID)
        .single();
      if (error) throw error;
      if (data) {
        return data.credits;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createBetter(userID: string) {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .insert([{userID: userID, credits: 1000, activeCredits: 0}]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async checkIfUserAlreadyBetted(userID: string, fixtureID: number): Promise<boolean> {
    try {
      const {data, error} = await this.supabase.supabaseClient
        .from('bettingrecord')
        .select('betterID')
        .eq('fixtureID', fixtureID)
        .eq('betterID', userID);
      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async fetchAllPendingBets(userID: string | undefined): Promise<BetWithFixture[]> {
    try {
      // First, get the betterID for the given userID
      const {data: betterData, error: betterError} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('betterID')
        .eq('userID', userID)
        .single();

      if (betterError) throw betterError;
      if (!betterData) throw new Error('Better not found');
      console.log(betterData);

      const response = await this.supabase.supabaseClient
        .from('bettingrecord')
        .select(`
        *,
        fixture:fixtureID (*,
            team0_details:team0 (*),
            team1_details:team1 (*)
    )
      `)
        .eq('betterID', betterData.betterID)
        .is('outcome', null);

      if (response.error) throw response.error;

      console.log(response.data);

      const betsWithFixtures: BetWithFixture[] = response.data.map(item => {
        // Destructure your item to access nested fixture and team details directly
        const {fixtureID, id, betterID, time_placed, team_chosen, credits, outcome, time_settled, fixture} = item;
        const {team0_details, team1_details} = fixture;

        return {
          bet: {
            id,
            betterID,
            fixtureID,
            time_placed,
            team_chosen,
            credits,
            outcome,
            time_settled
          },
          fixture: {
            fixture: fixture.fixture,
            league: fixture.league,
            teams: fixture.teams,
            goals: fixture.goals,
            score: fixture.score
          },
          team0_details: {
            id: team0_details.id,
            name: team0_details.name,
            points: team0_details.points,
            goalDifference: team0_details.goalDifference
          },
          team1_details: {
            id: team1_details.id,
            name: team1_details.name,
            points: team1_details.points,
            goalDifference: team1_details.goalDifference
          }
        };
      });

      return betsWithFixtures;
    } catch (error) {
      console.error('Error fetching pending bets:', error);
      throw error;
    }
  }

  async fetchSettledBets(userID: string | undefined): Promise<BetWithFixture[]> {
    try {
      // First, get the betterID for the given userID
      const {data: betterData, error: betterError} = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('betterID')
        .eq('userID', userID)
        .single();

      if (betterError) throw betterError;
      if (!betterData) throw new Error('Better not found');
      console.log(betterData);

      const response = await this.supabase.supabaseClient
        .from('bettingrecord')
        .select(`
        *,
        fixture:fixtureID (*,
            team0_details:team0 (*),
            team1_details:team1 (*)
    )
      `)
        .eq('betterID', betterData.betterID)
        .not('outcome', 'is', null)  // Adjust this based on how you determine a bet is settled
        .or('time_settled.not.is.null');

      if (response.error) throw response.error;

      console.log(response.data);

      const betsWithFixtures: BetWithFixture[] = response.data.map(item => {
        // Destructure your item to access nested fixture and team details directly
        const {fixtureID, id, betterID, time_placed, team_chosen, credits, outcome, time_settled, fixture} = item;
        const {team0_details, team1_details} = fixture;

        return {
          bet: {
            id,
            betterID,
            fixtureID,
            time_placed,
            team_chosen,
            credits,
            outcome,
            time_settled
          },
          fixture: {
            fixture: fixture.fixture,
            league: fixture.league,
            teams: fixture.teams,
            goals: fixture.goals,
            score: fixture.score
          },
          team0_details: {
            id: team0_details.id,
            name: team0_details.name,
            points: team0_details.points,
            goalDifference: team0_details.goalDifference
          },
          team1_details: {
            id: team1_details.id,
            name: team1_details.name,
            points: team1_details.points,
            goalDifference: team1_details.goalDifference
          }
        };
      });

      return betsWithFixtures;
    } catch (error) {
      console.error('Error fetching pending bets:', error);
      throw error;
    }
  }
}




