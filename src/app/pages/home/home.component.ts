import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {ThemeService} from "../../core/services/theme.service";
import {initFlowbite} from "flowbite";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  session: any; // Adjust the type based on your session object

  constructor(
    private router: Router,
    protected readonly authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to the auth state changes
    this.authService.authChanges((_, session) => (this.session = session));
    initFlowbite();
  }

  hideForm = false;
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

}
