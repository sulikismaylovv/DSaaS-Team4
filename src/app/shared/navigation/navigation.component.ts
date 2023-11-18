import { Component } from '@angular/core';
import {NavbarService} from "../../core/services/navbar.service";
import {ThemeService} from "../../core/services/theme.service";
import {AuthService} from "../../core/services/auth.service";

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
  ) { }

}
