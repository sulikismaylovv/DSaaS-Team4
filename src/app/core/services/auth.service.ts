import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from 'src/app/core/services/supabase.service';

export interface Profile {
  id?: string;
  username: string;
  email: string;
  birthdate?: Date;
  password?: string;
  first_name: string;
  last_name: string;
}

interface RegisterResponse {
  dataProfile?: Profile;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private currentProfile: Profile | null = null;

  constructor(private supabase: SupabaseService) {
    this.supabase.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        this.currentUser = session?.user ?? null;
        // Load the profile data when the user signs in
        await this.loadProfile();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.currentProfile = null; // Clear profile data on sign out
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  async signIn(credentials: { usernameOrEmail: string; password: string }): Promise<void> {
    const { usernameOrEmail, password } = credentials;
    const isEmail = usernameOrEmail.includes('@');
    let emailToUse = usernameOrEmail;

    if (!isEmail) {
      const { data, error } = await this.supabase.supabaseClient
        .from('users')
        .select('email')
        .eq('username', usernameOrEmail)
        .single();

      if (error) {
        console.error('Sign In Error:', error.message);
        throw error;
      }

      if (data && data.email) {
        emailToUse = data.email;
      } else {
        throw new Error('User not found');
      }
    }

    const { error } = await this.supabase.supabaseClient.auth.signInWithPassword({ email: emailToUse, password });
    if (error) {
      throw new Error('Invalid email/password combination');
    }
  }

  async register(email: string, password: string, additionalDetails: Profile): Promise<RegisterResponse> {
    const signUpResponse = await this.supabase.supabaseClient.auth.signUp({ email, password });
    if (signUpResponse.error) throw signUpResponse.error;

    alert('Registration successful! Please check your email to verify your account.');

    const userId = signUpResponse.data?.user?.id;
    if (!userId) throw new Error('User ID not found after registration.');

    return { dataProfile: await this.completeProfileSetup(userId, additionalDetails) };
  }

  async completeProfileSetup(userId: string, additionalDetails: Profile): Promise<Profile> {
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .insert([{ ...additionalDetails, id: userId }])
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Profile) {
    const update = { ...profile, updated_at: new Date() };
    return this.supabase.supabaseClient.from('users').upsert(update);
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.supabaseClient.auth.onAuthStateChange(callback);
  }

  private async loadProfile() {
    if (this.currentUser) {
      const { data, error } = await this.supabase.supabaseClient
        .from('users')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error.message);
        return;
      }

      this.currentProfile = data;
    }
  }

  async logout() {
    await this.supabase.supabaseClient.auth.signOut();
  }

  public getProfile(): Profile | null | undefined {
    return this.currentProfile;
  }
}
