import {Component} from '@angular/core';
import {NavbarService} from "../../core/services/navbar.service";
import {ThemeService} from "../../core/services/theme.service";
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

    constructor(
        public navbarService: NavbarService,
        public themeService: ThemeService,
        protected readonly authService: AuthService,
        private router: Router
    ) {
    }

  async navigateToLogin() {
    await this.router.navigateByUrl('/login'); // Adjust the path as necessary for your app's route configuration
  }

  async navigatetoRegister() {
      await this.router.navigateByUrl('/register'); // Adjust the path as necessary for your app's route configuration
  }// }

}
