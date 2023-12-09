import {Injectable} from '@angular/core';
import {SupabaseService} from 'src/app/core/services/supabase.service';

export interface Preference {
    user_id: string; // UUID type to match the user_id in the table
    club_id: string; // BigInt type for club_id
    favorite_club: boolean; // Boolean type for favorite_club
    followed_club: boolean; // Boolean type for followed_club
    updated_at?: Date; // Optional Date type for updated_at
}

export interface Club {
    id?: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
    leagueID: number;
}

@Injectable({
    providedIn: 'root'
})


export class PreferencesService {

    constructor(private supabase: SupabaseService) {
    }

    async upsertPreference(preference: Preference) {
        try {
            const clubIdBigInt = BigInt(preference.club_id);

            // Perform checks before updating preferences
            await this.checkAndUpdatePreferences(preference.user_id, clubIdBigInt, preference.favorite_club, preference.followed_club);

            const {data, error} = await this.supabase.supabaseClient
                .from('preferences')
                .upsert(preference);

            if (error) {
                console.error('Error upserting preference:', error);
                throw error;
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                alert(error.message); // Alert the user with the error message
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async deletePreference(preference: Preference) {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('preferences')
                .delete()
                .match({user_id: preference.user_id, club_id: preference.club_id, favorite_club: preference.favorite_club, followed_club: preference.followed_club});

            if (error) {
                console.error('Error deleting preference:', error);
                throw error;
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                alert(error.message); // Alert the user with the error message
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async getFavoritePreferences(userId: string): Promise<Preference> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('preferences')
                .select('*')
                .eq('user_id', userId)
                .eq('favorite_club', true);

            if (error) {
                console.error('Error fetching favorite preferences:', error);
                throw error;
            }

            return data[0];
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                alert(error.message); // Alert the user with the error message
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async getFollowedPreferences(userId: string): Promise<Preference[]> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('preferences')
                .select('*')
                .eq('user_id', userId)
                .eq('followed_club', true);

            if (error) {
                console.error('Error fetching followed preferences:', error);
                throw error;
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                alert(error.message); // Alert the user with the error message
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

  private async checkAndUpdatePreferences(userId: string, clubId: bigint, isFavorite: boolean, isFollowed: boolean): Promise<void> {
    // Fetch existing preferences
    const {data: existingPreferences, error} = await this.supabase.supabaseClient
      .from('preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching existing preferences:', error);
      throw error;
    }

    // Check if the team is already followed
    const isAlreadyFollowed = existingPreferences.some(pref => pref.club_id === clubId.toString() && pref.followed_club);

    // If the team is already followed and is being set to followed again, throw an error
    if (isFollowed && isAlreadyFollowed) {
      throw new Error('This team is already followed. Try again.');
    }

    // If setting a new favorite team
    if (isFavorite) {
      // Find and update the old favorite team, if it exists
      const oldFavorite = existingPreferences.find(pref => pref.favorite_club);
      if (oldFavorite) {
        await this.upsertPreference({...oldFavorite, favorite_club: false});
      }

      // If the new favorite team is not already followed, set it as followed
      if (!isAlreadyFollowed) {
        await this.upsertPreference({ user_id: userId, club_id: clubId.toString(), favorite_club: false, followed_club: true });
      }
    }
  }


  async getPreferences(userId: string): Promise<Preference[]> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('preferences')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching preferences:', error);
                throw error;
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
                alert(error.message); // Alert the user with the error message
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async getClubByClubId(clubId: number): Promise<Club> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('clubs')
                .select('*')
                .eq('id', clubId);

            if (error) {
                console.error('Error fetching club:', error);
                throw error;
            }
            return data[0];
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async fetchAllClubs(): Promise<Club[]> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('clubs')
                .select('*');

            if (error) {
                console.error('Error fetching clubs:', error);
                throw error;
            }
            return data;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async downLoadImage(imageUrl: string): Promise<Blob | undefined> {
      const {data, error} = await this.supabase.supabaseClient.storage
        .from('Club_logos')
        .download(imageUrl);

      if (error) {
        console.error('Error downloading image:', error);
        throw error;
      }

      return data;
    }
}
