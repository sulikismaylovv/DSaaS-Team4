import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Bet, Better } from '../models/bets.model';

@Injectable({
  providedIn: 'root'
})
export class BetsService {

  constructor(private supabase: SupabaseService) { }

  // async createBet(bet: Bet, ): Promise<Bet> {}
}
