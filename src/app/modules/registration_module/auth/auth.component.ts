import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';


import {AuthService, Profile} from '../../../core/services/auth.service';

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
      private router: Router,

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
    if (this.registerForm.valid) {
      try {
        this.loading = true;
        const email = this.registerForm.value.email as string;
        const password = this.registerForm.value.password as string;

        // Call the simplified register method without additional details
        await this.authService.register(email, password);
        // After the alert in the register method, control returns here.
        // Navigate to the email verification page
        await this.router.navigate(['/verify-email']);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      } finally {
        this.registerForm.reset();
        this.loading = false;
      }
    } else {
      // If the form is not valid, you can handle the errors here
      // For example, you can trigger validation messages in your template
      alert('Please correct the errors on the form.');
    }
  }

}
