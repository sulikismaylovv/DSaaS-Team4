import {Injectable} from '@angular/core';
import {AuthChangeEvent, AuthSession, Session, User} from '@supabase/supabase-js';
import {BehaviorSubject, catchError, from, Observable, of} from "rxjs";
import {SupabaseService} from 'src/app/core/services/supabase.service';
import {ConfigService} from "./config.service";
import {Router} from "@angular/router";
import {map} from "rxjs/operators";

export interface Profile {
    id?: string;
    username: string;
    email?: string;
    birthdate?: Date;
    password?: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    bg_url?: string;
    updated_at?: Date;
}
@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserEmail = new BehaviorSubject<string | null>(null);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
        private readonly configService: ConfigService,
        private supabase: SupabaseService,
        private router: Router
    ) {
        // Call restoreSession within an async IIFE (Immediately Invoked Function Expression)
        (async () => {
            await this.restoreSession();
        })();
        this.supabase.supabaseClient.auth.onAuthStateChange((event, session) => {
            this.handleAuthChange(event, session).then(r => true);
        });
    }


    private _session: AuthSession | null = null;

  setCurrentUserEmail(email: string): void {
    this.currentUserEmail.next(email);
  }

  getCurrentUserEmail(): Observable<string | null> {
    return this.currentUserEmail.asObservable();
  }

    async getUserUpdatedAt(): Promise<Date> {
        const profile = await this.getProfile();

        if (profile === undefined || profile.updated_at === undefined) {
            // Return a default date value (e.g., the current date) when profile is undefined or updated_at is null
            return new Date(); // You can replace this with your desired default date
        }

        return profile.updated_at;
    }

    async getProfile(): Promise<Profile | undefined> {
        try {
            const {data: profile, error} = await this.supabase.supabaseClient
                .from('users')
                .select(`*`)
                .eq('id', this._session?.user?.id)
                .single();

            if (error) {
                return undefined;
            }

            return profile;
        } catch (error) {
            if (error instanceof Error) {
                return undefined;
            }
        }
        return undefined;
    }


  get session() {
        this.supabase.supabaseClient.auth.getSession().then(({data}) => {
            this._session = data.session
        })
        return this._session
    }

    isAuthenticated(): boolean {
        return this.supabase.supabaseClient.auth.getSession() != null;
    }


    isLogged(): boolean {
        return this._session != null;
    }

  checkEmailExists(email: string): Observable<boolean> {
    return from(this.supabase.supabaseClient
      .from('users')
      .select('email', { count: 'exact' })
      .eq('email', email)
      .limit(1) // Limit the response to 1 row
    ).pipe(
      map(response => response.data && response.data.length > 0),
      catchError(() => of(false)), // Return false in case of any error
      map(result => !!result) // Ensure the result is a boolean
    );
  }

  checkUsernameExists(username: string, currentUserId: string): Observable<boolean> {
    const query = this.supabase.supabaseClient
      .from('users')
      .select('username')
      .eq('username', username)
      .not('id', 'eq', currentUserId) // Exclude the current user based on their ID
      .then(response => response.data ? response.data.length > 0 : false);

    return from(query).pipe(
      map(exists => exists)
    );
  }

    async signInWithProvider() {
        return this.supabase.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: this.configService.getFullUrl('profile')
            }
        });
    }
  private updateLoginStatus() {
    const session = this.supabase.supabaseClient.auth.getSession();
    this.isAuthenticatedSubject.next(session !== null);
  }

    async signIn(credentials: { usernameOrEmail: string; password: string }): Promise<void> {
        const {usernameOrEmail, password} = credentials;
        const isEmail = usernameOrEmail.includes('@');
        let emailToUse = usernameOrEmail;

        if (!isEmail) {
            const {data, error} = await this.supabase.supabaseClient
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

        const {error} = await this.supabase.supabaseClient.auth.signInWithPassword({email: emailToUse, password});
        if (error) {
            throw new Error('Invalid email/password combination');
        }
      this.updateLoginStatus();
    }

    async register(email: string, password: string): Promise<void> {
        const redirectUrl = this.configService.getFullUrl('complete-profile');
        const signUpResponse = await this.supabase.supabaseClient.auth.signUp({
            email, password
            , options: {
                emailRedirectTo: redirectUrl
            }
        });

        if (signUpResponse.error) throw signUpResponse.error;
    }

    async completeProfileSetup(userId: string, additionalDetails: Profile): Promise<Profile> {
        const {data, error} = await this.supabase.supabaseClient
            .from('users')
            .upsert([{...additionalDetails, id: userId}])
            .single();

        if (error) throw error;
        return data;
    }

    async updateProfile(profile: Profile) {
        // Extract only the fields you want to update
        const {username, last_name, first_name, birthdate, avatar_url} = profile;

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
        return this.supabase.supabaseClient.from('users').upsert(update);
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.supabaseClient.auth.onAuthStateChange(callback);
    }

    async logout() {
        try {
            await this.supabase.supabaseClient.auth.signOut();
            this.updateLoginStatus();
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



    downLoadImage(path: string) {
        return this.supabase.supabaseClient.storage.from('avatars').download(path)
    }

    uploadAvatar(filePath: string, file: File) {
        return this.supabase.supabaseClient.storage.from('avatars').upload(filePath, file)
    }

    downLoadBackground(path: string) {
        return this.supabase.supabaseClient.storage.from('background_user').download(path)
    }

    uploadBackground(filePath: string, file: File) {
        return this.supabase.supabaseClient.storage.from('background_user').upload(filePath, file)
    }

    downloadClub(path: string) {
        return this.supabase.supabaseClient.storage.from('Club_logos').download(path)
    }

    async restoreSession() {
        try {
            const {data: sessionData, error} = await this.supabase.supabaseClient.auth.getSession();
            if (error) {
                console.error('Error restoring session:', error);
                return;
            }
            this._session = sessionData.session;
            if (this._session) {
                // You may want to perform additional logic here if a session is restored
            }
        } catch (error) {
            console.error('Unexpected error restoring session:', error);
        }
    }

    private async handleAuthChange(event: AuthChangeEvent, session: Session | null) {
        this.isAuthenticatedSubject.next(session !== null);
        this._session = session;
        if (event === 'SIGNED_IN') {
            // Handle successful sign in
            //await this.router.navigate(['/home']);

        } else if (event === 'SIGNED_OUT') {
            // Handle sign out
            await this.router.navigate(['/login']);
        }
    }

  async profileById(userId: string) {
    return this.supabase.supabaseClient
      .from('users')
      .select(`*`)
      .eq('id', userId)
      .single()

  }

  async updateUser(param: { background: string }) {
    const {background} = param;
    const update = {
      id: this._session?.user?.id, // Ensure the correct user ID is used
      email: this._session?.user?.email, // Ensure the correct email is used
      bg_url: background,
      updated_at: new Date(),
    };
    return this.supabase.supabaseClient.from('users').upsert(update);

  }

  async resendVerificationEmail() {
      const email = this.currentUserEmail.value;
      if (email){
        return this.supabase.supabaseClient.auth.resend(
          {
            type: 'signup',
            email: email
          }
        )
      }
      else {
        throw new Error('Email not found');
      }


  }
}
