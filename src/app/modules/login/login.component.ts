import {AuthService} from "../../core/services/auth.service";
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {Session} from "@supabase/supabase-js";
import {NavbarService} from "../../core/services/navbar.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit{
  private session: Session | null | undefined;

  ngOnInit() {
    // Subscribe to the auth state changes
    this.navbarService.setShowNavbar(false);
    this.authService.authChanges((_, session) => (this.session = session));
  }

  signInForm!: FormGroup;
  loading = false;

  constructor(
    protected readonly authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    public navbarService: NavbarService
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
      await this.router.navigate(['/home']); // Redirect to dashboard
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

  async signInWithProvider() {
    try {
      await this.authService.signInWithProvider();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }
}
