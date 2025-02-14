import {Component, OnInit} from '@angular/core';
import {AuthService} from '../core/services/auth.service';
import {initFlowbite} from 'flowbite';
import {environment} from '../../environments/environment';
import {ThemeService} from '../core/services/theme.service';
import {NavigationEnd, Router} from '@angular/router';
import {GameComponent} from "../modules/game_module/game.component";
import {FooterService} from "../core/services/footer.service";
import {filter} from "rxjs/operators";

declare let gtag: Function; // Declare gtag function
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = environment.appTitle;
  session: any; // Adjust the type based on your session object
  protected readonly GameComponent = GameComponent;

  constructor(private router: Router, private footerService: FooterService, protected readonly authService: AuthService, public themeService: ThemeService) {}

  ngOnInit() {
    // Subscribe to the auth state changes
    this.authService.authChanges((_, session) => (this.session = session));
    initFlowbite();
    this.setUpAnalytics();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === '/register') {
          this.footerService.setShowFooter(false);
        } else {
          this.footerService.setShowFooter(false);
        }
      }
    });
  }
  setUpAnalytics() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEndEvent = event as NavigationEnd;
        gtag('config', 'G-34MNLJ2ZXW',
          {
            page_path: navigationEndEvent.urlAfterRedirects
          }
        );
      });
  }
}
