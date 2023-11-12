import { Injectable } from '@angular/core';
import {AuthChangeEvent, AuthSession, Session, User} from '@supabase/supabase-js';
import { SupabaseService } from 'src/app/core/services/supabase.service';

export interface Profile {
  id?: string;
  username: string;
  email?: string;
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
  private _session: AuthSession | null = null;

  constructor(private supabase: SupabaseService) {
    this.supabase.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      this._session = session;
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user);
        try {
        } catch (error) {
          console.error('Error while loading profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });
  }


  isAuthenticated(): boolean {
    return !!this._session?.user;
  }


  get session() {
    this.supabase.supabaseClient.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
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
    // Extract only the fields you want to update
    const { username, last_name, first_name, birthdate } = profile;

    const update = {
      id: this._session?.user?.id, // Ensure the correct user ID is used
      email: this._session?.user?.email, // Ensure the correct email is used
      username,
      last_name,
      first_name,
      birthdate,
      updated_at: new Date()
    };
    console.log(update);
    return this.supabase.supabaseClient.from('users').upsert(update);
  }


  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.supabaseClient.auth.onAuthStateChange(callback);
  }



  async logout() {
    try {
      await this.supabase.supabaseClient.auth.signOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
      // Handle logout error appropriately
    }
  }


  profile(user: User) {
    return this.supabase.supabaseClient
      .from('users')
      .select(`*`)
      .eq('id', user.id)
      .single()
  }
}
