import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import {SupabaseService} from "./supabase.service";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  constructor(private supabase: SupabaseService) {}

  async searchUserByUsername(username: string): Promise<any> {
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .select('id,username')
      .ilike('username', `%${username}%`);

    if (error) {
      console.error('Error searching for user:', error);
      throw error;
    }
    return data;
  }
}
