import {Injectable} from '@angular/core';
import {AuthChangeEvent, RealtimeChannel, Session, User} from '@supabase/supabase-js';
import {BehaviorSubject, Observable, skipWhile} from 'rxjs';
import {SupabaseService} from 'src/app/core/services/supabase.service';


export interface Profile {
  id?: string;
  username: string;
  email: string;
  avatar_url: string;
  birthdate?: Date;
  password?: string;
  first_name: string;
  last_name: string;
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

        // Initialize Supabase user
        // Get initial user from the current session, if exists
        this.supabase.supabase.auth.getUser().then(({ data, error }) => {
            this._$user.next(data && data.user && !error ? data.user : null);

            // After the initial value is set, listen for auth state changes
            this.supabase.supabase.auth.onAuthStateChange((event, session) => {
                this._$user.next(session?.user ?? null);
            });
        });

        // Initialize the user's profile
// The state of the user's profile is dependent on their being a user. If no user is set, there shouldn't be a profile.
        this.$user.subscribe(user => {
            if (user) {
                // We only make changes if the user is different
                if (user.id !== this.user_id) {
                    const user_id = user.id;
                    this.user_id = user_id;

                    // One-time API call to Supabase to get the user's profile
                    this.supabase
                        .supabase
                        .from('users')
                        .select('*')
                        .match({ user_id })
                        .single()
                        .then(res => {

                            // Update our profile BehaviorSubject with the current value
                            this._$profile.next(res.data ?? null);

                            // Listen to any changes to our user's profile using Supabase Realtime
                            this.profile_subscription = this.supabase
                                .supabase
                                .channel('public:users')
                                .on('postgres_changes', {
                                    event: '*',
                                    schema: 'public',
                                    table: 'users',
                                    filter: 'user_id=eq.' + user.id
                                }, (payload: any) => {

                                    // Update our profile BehaviorSubject with the newest value
                                    this._$profile.next(payload.new);

                                })
                                .subscribe()

                        })
                }
            }
            else {
                // If there is no user, update the profile BehaviorSubject, delete the user_id, and unsubscribe from Supabase Realtime
                this._$profile.next(null);
                delete this.user_id;
                if (this.profile_subscription) {
                    this.supabase.supabase.removeChannel(this.profile_subscription).then(res => {
                        console.log('Removed profile channel subscription with status: ', res);
                    });
                }
            }
        })

    }

    profile(user: User) {
        return this.supabase.supabase
            .from('users') // Changed from 'profiles' to 'users'
            .select(`username, email, avatar_url, birthdate, first_name, last_name`) // Updated fields
            .eq('id', user.id)
            .single();
    }

    async signIn(credentials: { usernameOrEmail: string; password: string }) {
        const {usernameOrEmail, password} = credentials;
        const isEmail = usernameOrEmail.includes('@');

        if (isEmail) {
            return this.supabase.supabase.auth.signInWithPassword({email: usernameOrEmail, password});
        } else {
            const {data, error} = await this.supabase.supabase
                .from('users')
                .select('email')
                .eq('username', usernameOrEmail)
                .single();

            if (error) {
                console.error('Sign In Error:', error.message);
                throw error;
            }

            if (data && data.email) {
                return this.supabase.supabase.auth.signInWithPassword({email: data.email, password});
            } else {
                throw new Error('User not found');
            }
        }
    }

    async register(email: string, password: string) {
        return this.supabase.supabase.auth.signUp({email, password});
    }

    async updateProfile(profile: Profile) {
        const update = {
            ...profile,
            updated_at: new Date(),
        };

        return this.supabase.supabase.from('users').upsert(update);
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.supabase.auth.onAuthStateChange(callback);
    }


    async logout() {
        await this.supabase.supabase.auth.signOut();
    }
}
