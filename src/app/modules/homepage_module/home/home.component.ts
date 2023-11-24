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
        private router: Router,
        protected readonly authService: AuthService,
        public themeService: ThemeService,
        public navbarService: NavbarService
    ) {
    }

    ngOnInit() {
        // Subscribe to the auth state changes
        this.authService.authChanges((_, session) => (this.session = session));
        this.navbarService.setShowNavbar(true);
        initFlowbite();
    }

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

    showPostsContent() {
        this.showPosts = true;
        this.showMatches = false;
    }

    showMatchesContent() {
        this.showPosts = false;
        this.showMatches = true;
    }
}
