import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthSession } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  loading = false;
  profile!: Profile;

  @Input()
  session!: AuthSession;

  updateProfileForm = this.formBuilder.group({
    username: '',
    avatar_url: '',
    birthdate: '', // New field
    first_name: '', // New field
    last_name: '', // New field
    // Add any other fields as needed
  });

  constructor(private readonly supabase: SupabaseService, private formBuilder: FormBuilder) {}

  async ngOnInit(): Promise<void> {
    await this.getProfile();

    const { username, avatar_url, birthdate, first_name, last_name } = this.profile; // Updated fields
    this.updateProfileForm.patchValue({
      username,
      avatar_url,
      birthdate: birthdate ? birthdate.toISOString().split('T')[0] : null, // Convert Date to 'YYYY-MM-DD' format
      first_name,
      last_name,
      // Add any other fields as needed
    });
  }

  async getProfile() {
    try {
      this.loading = true;
      const { user } = this.session;
      const { data: profile, error, status } = await this.supabase.profile(user);


      if (error && status !== 406) {
        throw error;
      }

      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async updateProfile(): Promise<void> {
    try {
      this.loading = true;
      const { user } = this.session;

      const username = this.updateProfileForm.value.username as string;
      const avatar_url = this.updateProfileForm.value.avatar_url as string;
      const birthdateStr = this.updateProfileForm.value.birthdate as string | null | undefined;
      const birthdate = birthdateStr ? new Date(birthdateStr) : undefined;
      const first_name = this.updateProfileForm.value.first_name as string; // New field
      const last_name = this.updateProfileForm.value.last_name as string; // New field

      const { error } = await this.supabase.updateProfile({
        id: user.id,
        username,
        avatar_url,
        birthdate,
        first_name,
        last_name,
        // Add any other fields as needed
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await this.supabase.signOut();
  }
}
