import {Injectable} from '@angular/core';
import {AuthChangeEvent, AuthSession, Session, User} from '@supabase/supabase-js';
import {SupabaseService} from 'src/app/core/services/supabase.service';
import {ConfigService} from "./config.service";
import {Router} from "@angular/router";

export interface Profile {
  id?: string;
  username: string;
  email?: string;
  birthdate?: Date;
  password?: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
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


    constructor(
        private readonly configService: ConfigService,
        private supabase: SupabaseService,
        private router : Router
    ) {
        // Call restoreSession within an async IIFE (Immediately Invoked Function Expression)
        (async () => {
            await this.restoreSession();
        })();
        this.supabase.supabaseClient.auth.onAuthStateChange((event, session) => {
            this.handleAuthChange(event, session);
        });
    }

    private async restoreSession() {
        try {
            const { data: sessionData, error } = await this.supabase.supabaseClient.auth.getSession();
            if (error) {
                console.error('Error restoring session:', error);
                return;
            }
            this._session = sessionData.session;
            if (this._session) {
                console.log('Session restored:', this._session);
                // You may want to perform additional logic here if a session is restored
            }
        } catch (error) {
            console.error('Unexpected error restoring session:', error);
        }
    }


    private async handleAuthChange(event: AuthChangeEvent, session: Session | null) {
      this._session = session;
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user);
        // Handle successful sign in
        //await this.router.navigate(['/home']);

      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        // Handle sign out
        await this.router.navigate(['/login']);
      }
    }

  isAuthenticated(): boolean {
      return  this.supabase.supabaseClient.auth.getSession() != null;
  }


  get session() {
    this.supabase.supabaseClient.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  async signInWithProvider() {
    return this.supabase.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
        options: {
          redirectTo: this.configService.getFullUrl('home')
        }
      });
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

  async register(email: string, password: string): Promise<void> {
    const redirectUrl = this.configService.getFullUrl('complete-profile');
    const signUpResponse = await this.supabase.supabaseClient.auth.signUp({ email, password
      , options: {
      emailRedirectTo: redirectUrl
    }});

    if (signUpResponse.error) throw signUpResponse.error;

    alert('Registration successful! Please check your email to verify your account.');
  }

  async completeProfileSetup(userId: string, additionalDetails: Profile): Promise<Profile> {
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .upsert([{ ...additionalDetails, id: userId }])
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Profile) {
    // Extract only the fields you want to update
    const { username, last_name, first_name, birthdate, avatar_url } = profile;

    const update = {
      id: this._session?.user?.id, // Ensure the correct user ID is used
      email: this._session?.user?.email, // Ensure the correct email is used
      username,
      last_name,
      first_name,
      birthdate,
      updated_at: new Date(),
      avatar_url
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

  downLoadImage(path: string)  {
    return this.supabase.supabaseClient.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.supabaseClient.storage.from('avatars').upload(filePath, file)
  }
}
