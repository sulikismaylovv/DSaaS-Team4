import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {ThemeService} from "../../../core/services/theme.service";
import {NavbarService} from "../../../core/services/navbar.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {SupabaseFixture, SupabaseFixtureModel} from "../../../core/models/supabase-fixtures.model";
import {Club} from "../../../core/models/club.model";
import {FixtureTransferService} from "../../../core/services/fixture-transfer.service";
import {ApiService} from "../../../core/services/api.service";
import {DailyAwardService} from "../../../core/services/daily-award.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  fixture: SupabaseFixture = new SupabaseFixtureModel();
  league: Club[] = [];



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
    protected readonly imageDownloadService: ImageDownloadService,
    private fixtureTransferService: FixtureTransferService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dailyAwardService: DailyAwardService

  ) {
  }
  ngOnInit() {
    this.dailyAwardService.openPopup();
    this.navbarService.setShowNavbar(true);
    this.getStanding();
  }

  async getStanding() {
    const data = await this.apiService.fetchStandings();
    this.league = data;
    console.log(this.league);
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
