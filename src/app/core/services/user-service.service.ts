import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import {SupabaseService} from "./supabase.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  constructor(private supabase: SupabaseService,private authService: AuthService) {}

  async searchUserByUsername(username: string): Promise<any> {
    const currentUserId = this.authService.session?.user?.id; // Get the current user's ID from the AuthService
    if (!currentUserId) {
      console.error('No current user ID found');
      return [];
    }
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .select('id,username')
      .ilike('username', `%${username}%`)
      .not('id', 'eq', currentUserId); // Exclude the current user from the results


    console.log('data:', data);

    if (error) {
      console.error('Error searching for user:', error);
      throw error;
    }
    return data;
  }

  async getUserById(id: string): Promise<any> {
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .select('id,username')
      .eq('id', id);

    console.log('data:', data);

    if (error) {
      console.error('Error searching for user:', error);
      throw error;
    }
    return data?.at(0)?.username;
  }
}
