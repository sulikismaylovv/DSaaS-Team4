import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Bet, Better } from '../models/bets.model';

@Injectable({
  providedIn: 'root'
})
export class BetsService {

  constructor(private supabase: SupabaseService) { }

  async createBet(bet: Bet, userID: string) {
    try {
      // Check if user is registered and retrieve the betterID
      const { data: userData, error: userError } = await this.supabase.supabaseClient
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
      const { error: betError } = await this.supabase.supabaseClient
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
      const { data, error } = await this.supabase.supabaseClient
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

  async checkIfUserAffordsBet(userID: string, credits: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.supabaseClient
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
      const { data, error: fetchError } = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('credits, activeCredits') 
        .eq('userID', userID)
        .single();
  
      if (fetchError) throw fetchError;
      if (!data) {
        console.error('User not found');
        return false;
      }
  
      // Calculate new values
      const newCredits = data.credits - creditsOffset;
      const newActiveCredits = data.activeCredits + creditsOffset;
  
      // Update both credits and activeCredits
      const { error: updateError } = await this.supabase.supabaseClient
        .from('usersinbetting')
        .update({ credits: newCredits, activeCredits: newActiveCredits }) 
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
      const { data, error } = await this.supabase.supabaseClient
        .from('usersinbetting')
        .select('userID')
        .eq('userID', userID);
      if (error) throw error;
      if (data.length > 0){
        return true;
      } else{
        return false;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userID: string){
    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('usersinbetting')
        .insert([{ userID: userID, credits: 1000, activeCredits: 0 }]);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  
  


}
