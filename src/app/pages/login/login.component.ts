import {AuthService} from "../../core/services/auth.service"
import { Component } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  signInForm!: FormGroup;
  loading = false;

  constructor(
      protected readonly authService: AuthService,
      private router: Router,
      private formBuilder: FormBuilder) {
          this.signInForm = this.formBuilder.group({
      usernameOrEmail: '',
      password: '',
    });
  }


  // Sign-in method
  async onSignIn(): Promise<void> {
    try {
      this.loading = true;
      const usernameOrEmail = this.signInForm.value.usernameOrEmail as string;
      const password = this.signInForm.value.password as string;

      // Call the signIn method with the usernameOrEmail and password
      const response = await this.authService.signIn({ usernameOrEmail, password });
      if (response.error) throw response.error;

      // Handle successful sign-in
      // Redirect to dashboard or perform other actions as needed
      this.router.navigate(['/dashboard']);
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


