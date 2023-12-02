import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {ThemeService} from "../../../core/services/theme.service";
import {initFlowbite} from "flowbite";
import {NavbarService} from "../../../core/services/navbar.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    session: any; // Adjust the type based on your session object
    hideForm = false;
    showPosts: boolean = true;
    showMatches: boolean = false;

    constructor(
      public themeService: ThemeService,
      public navbarService: NavbarService,
      private router: Router,
      protected readonly authService: AuthService,) {
    }

    ngOnInit() {
      this.navbarService.setShowNavbar(true);
      // Subscribe to the auth state changes
      this.authService.authChanges((_, session) => (this.session = session));
    }
  // Method to close the sidebar


    toggle() {
        this.hideForm = !this.hideForm;
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    isAuthenticated(): boolean {
        // Use the isAuthenticated method from AuthService
        return this.authService.isAuthenticated();
    }

  async navigateToLogin() {
    await this.router.navigateByUrl('/login'); // Adjust the path as necessary for your app's route configuration
  }

    showPostsContent() {
        this.showPosts = true;
        this.showMatches = false;
    }

    showMatchesContent() {
        this.showPosts = false;
        this.showMatches = true;
    }

}
