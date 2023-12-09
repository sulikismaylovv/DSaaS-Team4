import {Injectable} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {AuthService} from "./auth.service";
import { FriendshipService } from './friendship.service';

@Injectable({
    providedIn: 'root'
})
export class UserServiceService {
    constructor(private supabase: SupabaseService, private authService: AuthService,
                private friendshipService: FriendshipService
    ) {
    }

    async searchUserByUsername(username: string): Promise<any> {
      //console.log('searchUserByUsername:', username);
        const currentUserId = this.authService.session?.user?.id; // Get the current user's ID from the AuthService
        if (!currentUserId) {
            console.error('No current user ID found');
            return [];
        }
        const {data, error} = await this.supabase.supabaseClient
            .from('users')
            .select('id,username')
            .ilike('username', `%${username}%`)
            .not('id', 'eq', currentUserId); // Exclude the current user from the results

        if (error) {
            console.error('Error searching for user:', error);
            throw error;
        }
        return data;
    }


    async searchUsersByFirstThreeLetters(term: string): Promise<any[]> {
        //console.log('searchUsersByFirstThreeLetters:', term);
        const currentUserId = this.authService.session?.user?.id;
        if (!currentUserId) {
            console.error('No current user ID found');
            return [];
        }

        // Check if the search term is at least 3 characters long
        if (term.length < 3) {
            console.warn('Search term must be at least 3 characters');
            return [];
        }

        // Use the `or` functionality of Supabase to search across multiple columns
        const query = `first_name.ilike.%${term}%,last_name.ilike.%${term}%,username.ilike.%${term}%`;

        const { data, error } = await this.supabase.supabaseClient
            .from('users')
            .select('id, first_name, last_name, username')
            .or(query)
            .not('id', 'eq', currentUserId); // Exclude the current user from the results

        if (error) {
            console.error('Error searching for users:', error);
            throw error;
        }

        return data;
    }

    async getUsernameByID(id: string): Promise<any> {
        const {data, error} = await this.supabase.supabaseClient
            .from('users')
            .select('id,username')
            .eq('id', id);

        if (error) {
            console.error('Error searching for user:', error);
            throw error;
        }
        return data?.at(0)?.username;
    }


    async getUserByID(id: string): Promise<any> {
        const data = await this.supabase.supabaseClient
            .from('users')
            .select('*')
            .eq('id', id);

        if (data.error) {
            console.error('Error searching for user:', data.error);
            throw data.error;
        }
        return data.data?.at(0);

    }

  async searchFriendsByUsername(username: string): Promise<any> {
      //console.log('searchFriendsByUsername:', username);
    const currentUserId = this.authService.session?.user?.id;
    if (!currentUserId) {
      console.error('No current user ID found');
      return [];
    }

    try {
      // First, get the list of friend IDs
      const friendIds = await this.friendshipService.getFriends(currentUserId);
      //console.log('friendIds:', friendIds);

      // Then, search for friends by username using the list of friend IDs
      const { data, error } = await this.supabase.supabaseClient
        .from('users')
        .select('id,username')
        .ilike('username', `%${username}%`)
        .in('id', friendIds); // Search within friends only

      if (error) {
        console.error('Error searching for friends by username:', error);
      }
      return data;
    } catch (error) {
      console.error('Error searching for friends by username:', error);
      throw error;
    }
  }
}
