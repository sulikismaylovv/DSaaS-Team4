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

  signInFormEmail = this.formBuilder.group({
    email2: '',
  })

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
      const { error } = await this.supabase.register(email, password);
      if (error) throw error;
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

  async onSubmitEmail(): Promise<void> {
    try {
      this.loading = true
      const email2 = this.signInForm.value.email as string
      const { error } = await this.supabase.signIn(email2)
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      this.signInForm.reset()
      this.loading = false
    }
  }
}
