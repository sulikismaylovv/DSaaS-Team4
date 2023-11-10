import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import {ReactiveFormsModule , Validators } from "@angular/forms";

import {AuthService, Profile} from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})

export class AuthComponent {
  registerForm!: FormGroup;
  loading = false;


  matchingPasswords(group: FormGroup): { [key: string]: any } | null {
    const password = group.controls['password'].value;
    const confirmPassword = group.controls['confirmPassword'].value;
    return password === confirmPassword ? null : { 'mismatchedPasswords': true };
  }

  constructor(
      protected readonly authService: AuthService,

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

      // Define additional user details
      const additionalDetails: Profile = {
        username: 'someUsername', // You might want to add this to your form
        email: email,
        first_name: '', // Set default or get from form
        last_name: '', // Set default or get from form
        // other fields as needed
      };

      const response = await this.authService.register(email, password, additionalDetails);
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

}
