import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  loading = false;

  // Add password field to the form
  signInForm = this.formBuilder.group({
    email: '',
    password: '',
  });

  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
      const password = this.signInForm.value.password as string;

      // Register the user
      let response = await this.supabase.register(email, password);
      if (response.error) throw response.error;

      response = await this.supabase.signIn(email);
      if (response.error) throw response.error;

      alert('Check your email for the confirmation link!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }
}
