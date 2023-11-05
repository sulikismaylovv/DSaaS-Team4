import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { SupabaseService } from '../supabase.service';
import {ReactiveFormsModule , Validators } from "@angular/forms";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  registerForm!: FormGroup;
  loading = false;

  // Separate form groups for sign-in and registration
  signInForm = this.formBuilder.group({
    usernameOrEmail: '',
    password: '',
  });

  matchingPasswords(group: FormGroup): { [key: string]: any } | null {
    const password = group.controls['password'].value;
    const confirmPassword = group.controls['confirmPassword'].value;
    return password === confirmPassword ? null : { 'mismatchedPasswords': true };
  }

  constructor(

    private readonly supabase: SupabaseService,

    private formBuilder: FormBuilder) {
      this.registerForm = this.formBuilder.group({
        email: formBuilder.control('', [Validators.required, Validators.email, Validators.minLength(5)]),
        password: ['', [
          Validators.required,
          Validators.minLength(8), // Minimum length for the password
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$') // Passwords must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
        ]],
        confirmPassword: ['', Validators.required]
      }, { validator: this.matchingPasswords });

  }


  // Registration method
  async onRegister(): Promise<void> {
    try {
      this.loading = true;
      const email = this.registerForm.value.email as string;
      const password = this.registerForm.value.password as string;

      const response = await this.supabase.register(email, password);
      if (response.error) throw response.error;

      alert('You are successfully registered!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.registerForm.reset();
      this.loading = false;
    }
  }

  // Sign-in method
  async onSignIn(): Promise<void> {
    try {
      this.loading = true;
      const usernameOrEmail = this.signInForm.value.usernameOrEmail as string;
      const password = this.signInForm.value.password as string;

      // Call the signIn method with the usernameOrEmail and password
      const response = await this.supabase.signIn({ usernameOrEmail, password });
      if (response.error) throw response.error;

      // Handle successful sign-in
      // Redirect to dashboard or perform other actions as needed
      alert('You are successfully signed in!');
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
