import {Injectable} from '@angular/core';
import {AuthChangeEvent, RealtimeChannel, Session, User} from '@supabase/supabase-js';
import {BehaviorSubject, Observable, skipWhile} from 'rxjs';
import {SupabaseService} from 'src/app/core/services/supabase.service';


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
    dataProfile?: Profile; // Assuming the successful response includes the Profile
    error?: any; // You can replace 'any' with a more specific error type if available
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {


    // Supabase user state
    private _$user = new BehaviorSubject<User | null | undefined>(undefined);
    $user = this._$user.pipe(skipWhile(_ => typeof _ === 'undefined')) as Observable<User | null>;
    private user_id?: string;

    // Profile state
    private _$profile = new BehaviorSubject<Profile | null | undefined>(undefined);
    $profile = this._$profile.pipe(skipWhile(_ => typeof _ === 'undefined')) as Observable<Profile | null>;
    private profile_subscription?: RealtimeChannel;

    constructor(private supabase: SupabaseService) {
      this.supabase.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          this._$user.next(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          this._$user.next(null);
        }
      });

//         // Initialize Supabase user
//         // Get initial user from the current session, if exists
//         this.supabase.supabaseClient.auth.getUser().then(({ data, error }) => {
//             this._$user.next(data && data.user && !error ? data.user : null);
//
//             // After the initial value is set, listen for auth state changes
//             this.supabase.supabaseClient.auth.onAuthStateChange((event, session) => {
//                 this._$user.next(session?.user ?? null);
//             });
//         });
//
//         // Initialize the user's profile
// // The state of the user's profile is dependent on their being a user. If no user is set, there shouldn't be a profile.
//         this.$user.subscribe(user => {
//             if (user) {
//                 // We only make changes if the user is different
//                 if (user.id !== this.user_id) {
//                     const user_id = user.id;
//                     this.user_id = user_id;
//
//                     // One-time API call to Supabase to get the user's profile
//                     this.supabase
//                         .supabaseClient
//                         .from('users')
//                         .select('*')
//                         .match({ user_id })
//                         .single()
//                         .then(res => {
//
//                             // Update our profile BehaviorSubject with the current value
//                             this._$profile.next(res.data ?? null);
//
//                             // Listen to any changes to our user's profile using Supabase Realtime
//                             this.profile_subscription = this.supabase
//                                 .supabaseClient
//                                 .channel('public:users')
//                                 .on('postgres_changes', {
//                                     event: '*',
//                                     schema: 'public',
//                                     table: 'users',
//                                     filter: 'user_id=eq.' + user.id
//                                 }, (payload: any) => {
//
//                                     // Update our profile BehaviorSubject with the newest value
//                                     this._$profile.next(payload.new);
//
//                                 })
//                                 .subscribe()
//
//                         })
//                 }
//             }
//             else {
//                 // If there is no user, update the profile BehaviorSubject, delete the user_id, and unsubscribe from Supabase Realtime
//                 this._$profile.next(null);
//                 delete this.user_id;
//                 if (this.profile_subscription) {
//                     this.supabase.supabaseClient.removeChannel(this.profile_subscription).then(res => {
//                         console.log('Removed profile channel subscription with status: ', res);
//                     });
//                 }
//             }
//         })
//
     }

    profile(user: User) {
        return this.supabase.supabaseClient
            .from('users') // Changed from 'profiles' to 'users'
            .select(`username, email, avatar_url, birthdate, first_name, last_name`) // Updated fields
            .eq('id', user.id)
            .single();
    }



    async signIn(credentials: { usernameOrEmail: string; password: string }) {
        const {usernameOrEmail, password} = credentials;
        const isEmail = usernameOrEmail.includes('@');

        if (isEmail) {
            return this.supabase.supabaseClient.auth.signInWithPassword({email: usernameOrEmail, password});
        } else {
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
                return this.supabase.supabaseClient.auth.signInWithPassword({email: data.email, password});
            } else {
                throw new Error('User not found');
            }
        }
    }

  async register(email: string, password: string, additionalDetails: Profile): Promise<RegisterResponse> {
    const signUpResponse = await this.supabase.supabaseClient.auth.signUp({email, password});
    if (signUpResponse.error) throw signUpResponse.error;

    // Notify the user to verify their email before updating the profile
    alert('Registration successful! Please check your email to verify your account.');

    // Extract user ID from the response
    const userId = signUpResponse.data?.user?.id;
    if (!userId) throw new Error('User ID not found after registration.');

    // The next steps should be performed after the user has verified their email
    // Typically, you would have an email verification callback in which you would
    // call a method similar to `completeProfileSetup` to finalize the registration process
    return { dataProfile: await this.completeProfileSetup(userId, additionalDetails) };

  }

  // You can call this method from the email verification callback component
  async completeProfileSetup(userId: string, additionalDetails: Profile): Promise<Profile> {
    const { data, error } = await this.supabase.supabaseClient
      .from('users')
      .insert([{ ...additionalDetails, id: userId }])
      .single();

    if (error) throw error;
    return data;
  }

    async updateProfile(profile: Profile) {
        const update = {
            ...profile,
            updated_at: new Date(),
        };

        return this.supabase.supabaseClient.from('users').upsert(update);
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.supabaseClient.auth.onAuthStateChange(callback);
    }


    async logout() {
        await this.supabase.supabaseClient.auth.signOut();
    }
}
