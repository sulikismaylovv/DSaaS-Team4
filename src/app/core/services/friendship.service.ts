import {Injectable} from '@angular/core';
import {SupabaseService} from './supabase.service';

export interface Friendship {
  user1_id: string; // UUID of the first user
  user2_id: string; // UUID of the second user
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'; // Status of the friendship
  created_at?: Date; // Date when the friendship was created
  updated_at?: Date; // Date when the friendship was last updated
}

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  constructor(private supabase: SupabaseService) {}

  // Get the list of friends where the friendship status is 'accepted'
  async getFriends(userId: string): Promise<string[]> {
    try {
      const {data, error} = await this.supabase.supabaseClient
          .from('friendships')
          .select('*')
          // Combine the OR and conditions correctly
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'accepted');

      if (error) throw error;

      // Filter out the current user's ID and only return the friend's ID
      return data.map(friendship => {
        return friendship.user1_id === userId ? friendship.user2_id : friendship.user1_id;
      });

    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }


  // Send a friend request with a 'pending' status
  async addFriend(requesterId: string, addresseeId: string) {
    const { data, error } = await this.supabase.supabaseClient
      .from('friendships')
      .insert([
        { user1_id: requesterId, user2_id: addresseeId, status: 'pending' }
      ]);

    if (error) throw error;
    return data;
  }

  // Remove a friend regardless of who initiated the friendship
  async removeFriend(userId: string, friendId: string) {
    console.log('removeFriend', userId, friendId);
    // First try to delete where userId is user1_id and friendId is user2_id
    let {error} = await this.supabase.supabaseClient
      .from('friendships')
      .delete()
      .match({user1_id: userId, user2_id: friendId});

    // If no error and deletion is successful, return
    if (!error) return;

    // If first deletion didn't work, try the second combination
    ({error} = await this.supabase.supabaseClient
      .from('friendships')
      .delete()
      .match({user1_id: friendId, user2_id: userId}));

    // If there's an error in the second deletion, throw it
    if (error) throw error;
  }

  // Accept, reject, or block a friend request
  async updateFriendRequest(userId: string, friendId: string, status: 'accepted' | 'rejected' | 'blocked') {
    const { data, error } = await this.supabase.supabaseClient
      .from('friendships')
      .update({ status, updated_at: new Date() })
      .match({ user2_id: userId, user1_id: friendId, status: 'pending' });

    if (error) throw error;
    return data;
  }

  // Get the list of received friend requests with a 'pending' status
  async getFriendRequests(userId: string) {
    const { data, error } = await this.supabase.supabaseClient
      .from('friendships')
      .select('*')
      .eq('user2_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  }

  async checkFriendRequestStatus(userId: string | undefined, friendId: string): Promise<'accepted' | 'pending' | 'rejected' | 'blocked' | 'none' | undefined> {
    // Validate the input
    if (!userId || !friendId) {
      //console.error('User IDs are required');
      return undefined;
    }

    // Fetch the friendship status between user1 and user2
    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('friendships')
        .select('status')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`);

      if (error) {
        //console.error('Error fetching friend request status:', error);
        throw error;
      }

      // Log the data for debugging purposes
      //console.log('Friend request status:', data);

      // Determine the friendship status
      if (data && data.length > 0) {
        // Assuming the status field holds the friendship status
        const status = data[0].status;
        return status ? status : 'none';
      } else {
        // No friendship found
        return 'none';
      }
    } catch (error) {
      //console.error('Error fetching friend request status:', error);
      throw error;
    }
  }


  async checkIfFriends(userId: string | undefined, friendId: string,) : Promise<boolean | undefined> {
    // Validate the input
    if (!userId || !friendId) {
      console.error('User IDs are required');
      return undefined;
    }

    // Fetch the friendship status between user1 and user2
    try {
      const { data, error } = await this.supabase.supabaseClient
        .from('friendships')
        .select('status')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`);

      if (error) {
        console.error('Error fetching friend request status:', error);
        throw error;
      }

      // Log the data for debugging purposes
      //console.log('Friend request status:', data);

      // Determine the friendship status
      if (data && data.length > 0) {
        // Assuming the status field holds the friendship status
        const status = data[0].status;
        return status === 'accepted';
      } else {
        // No friendship found
        return false;
      }
    } catch (error) {
      console.error('Error fetching friend request status:', error);
      throw error;
    }
  }

}
