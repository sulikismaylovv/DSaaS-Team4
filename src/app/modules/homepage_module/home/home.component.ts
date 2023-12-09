import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {ThemeService} from "../../../core/services/theme.service";
import {NavbarService} from "../../../core/services/navbar.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  session: any; // Adjust the type based on your session object
  hideForm = false;
  showPosts = false;
  showMatches = true;
  activeContent = 'matches';
  userSearchResults: any[] = [];

  constructor(
    public themeService: ThemeService,
    public navbarService: NavbarService,
    private router: Router,
    protected readonly authService: AuthService,
    protected readonly userService: UserServiceService,
    protected readonly imageDownloadService: ImageDownloadService
    ) {
  }
  ngOnInit() {
    this.navbarService.setShowNavbar(true);
    // Subscribe to the auth state changes
    this.authService.authChanges((_, session) => (this.session = session));

  }

  async navigateToLogin() {
    await this.router.navigateByUrl('/login'); // Adjust the path as necessary for your app's route configuration
  }

  showPostsContent() {
    this.activeContent= 'posts';
    this.showPosts = true;
    this.showMatches = false;
  }

  showMatchesContent() {
    this.activeContent= 'matches';
    this.showPosts = false;
    this.showMatches = true;
  }

  async onUserSearch(event: any): Promise<void> {
    const searchTerm = event.target.value;
    if (searchTerm.length > 2) { // Trigger search when at least 3 characters are typed
      this.userSearchResults = await this.userService.searchUsersByFirstThreeLetters(searchTerm);
      for (const user of this.userSearchResults) {
            user.avatarSafeUrl = await this.imageDownloadService.loadAvatarImage(user.id);
      }
    } else {
      this.userSearchResults = [];
    }
  }


  async redirectToProfile(userId: string): Promise<void> {
    await this.router.navigateByUrl(`/profile/${userId}`);
  }

}
