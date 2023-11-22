import {Injectable} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class UserServiceService {
    constructor(private supabase: SupabaseService, private authService: AuthService) {
    }

    async searchUserByUsername(username: string): Promise<any> {
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
}
