import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { initFlowbite } from 'flowbite';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../core/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = environment.appTitle;
  session: any; // Adjust the type based on your session object

  constructor(
      private router: Router,
      public readonly authService: AuthService,
      public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to the auth state changes
    this.authService.authChanges((_, session) => (this.session = session));
    initFlowbite();
  }

  redirectToLogin() {
    this.router.navigate(['/login']); // Replace '/login' with your actual login route
  }

  hideForm = true;
  toggle() {
    this.hideForm = !this.hideForm;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
