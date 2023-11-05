  import { Injectable } from '@angular/core';
  import {
    AuthChangeEvent,
    AuthSession,
    createClient,
    Session,
    SupabaseClient,
    User,
  } from '@supabase/supabase-js';
  import { environment } from 'src/environments/environment';

  export interface Profile {
    id?: string;
    username: string;
    avatar_url: string;
    birthdate?: Date;
    password?: string; // Note: It's not recommended to handle raw passwords in client-side code.
    first_name: string;
    last_name: string;
    // Add any other fields as needed
  }

  @Injectable({
    providedIn: 'root',
  })
  export class SupabaseService {
    private supabase: SupabaseClient;
    _session: AuthSession | null = null;

    constructor() {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    get session() {
      this.supabase.auth.getSession().then(({ data }) => {
        this._session = data.session;
      });
      return this._session;
    }

    profile(user: User) {
      return this.supabase
        .from('users') // Changed from 'profiles' to 'users'
        .select(`username, avatar_url, birthdate, first_name, last_name`) // Updated fields
        .eq('id', user.id)
        .single();
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      return this.supabase.auth.onAuthStateChange(callback);
    }

    async register(email: string, password: string) {
      return this.supabase.auth.signUp({ email, password });
    }


    // SupabaseService
    async signIn(credentials: { usernameOrEmail: string; password: string }) {
      const { usernameOrEmail, password } = credentials;

      // Check if the input is an email or username
      const isEmail = usernameOrEmail.includes('@');

      if (isEmail) {
        // If it's an email, proceed with the normal sign-in process
        return this.supabase.auth.signInWithPassword({ email: usernameOrEmail, password });
      } else {
        // If it's a username, you need to find the associated email
        // Query your 'users' table where the username column matches the provided username
        const { data, error } = await this.supabase
          .from('users')
          .select('email')
          .eq('username', usernameOrEmail)
          .single();

        if (error) {
          console.error('Sign In Error:', error.message);
          throw error;
        }

        // If an associated email is found, use it to sign in
        if (data && data.email) {
          return this.supabase.auth.signInWithPassword({ email: data.email, password });
        } else {
          throw new Error('User not found');
        }
      }
    }



    signOut() {
      return this.supabase.auth.signOut();
    }

    updateProfile(profile: Profile) {
      const update = {
        ...profile,
        updated_at: new Date(),
      };

      return this.supabase.from('users').upsert(update); // Changed from 'profiles' to 'users'
    }

    downLoadImage(path: string) {
      return this.supabase.storage.from('avatars').download(path);
    }

    uploadAvatar(filePath: string, file: File) {
      return this.supabase.storage.from('avatars').upload(filePath, file);
    }
  }
