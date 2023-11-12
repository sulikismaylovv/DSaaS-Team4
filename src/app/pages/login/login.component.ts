import { AuthService } from "../../core/services/auth.service";
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    private formBuilder: FormBuilder
  ) {
    this.signInForm = this.formBuilder.group({
      usernameOrEmail: '',
      password: '',
    });
  }

  // Sign-in method
  async onSignIn(): Promise<void> {
    this.loading = true;
    const usernameOrEmail = this.signInForm.value.usernameOrEmail as string;
    const password = this.signInForm.value.password as string;

    try {
      // Call the signIn method with the usernameOrEmail and password
      await this.authService.signIn({ usernameOrEmail, password });
      console.log("User is authenticated, navigating to dashboard");
      // Handle successful sign-in
      await this.router.navigate(['/dashboard']); // Redirect to dashboard
    } catch (error) {
      // Handle the sign-in error
      if (error instanceof Error) {
        alert(error.message); // Show error message
        this.signInForm.reset(); // Reset the form in case of error
      }
    } finally {
      this.loading = false; // Stop the loading indicator
    }
  }
}
