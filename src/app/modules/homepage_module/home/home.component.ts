import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {NavbarService} from "../../../core/services/navbar.service";
import {Club} from "../../../core/models/club.model";
import {DailyAwardService} from "../../../core/services/daily-award.service";
import {AuthService} from "../../../core/services/auth.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  league: Club[] = [];
  userSearchResults: any[] = [];
  showPosts = false;
  showMatches = true;
  activeContent = 'matches';

  constructor(
    public navbarService: NavbarService,
    private router: Router,
    private dailyAwardService: DailyAwardService,
    protected readonly authService: AuthService,
    protected readonly userService: UserServiceService,
    protected readonly imageDownloadService: ImageDownloadService,
) {
  }
  ngOnInit() {
    this.dailyAwardService.openPopup();
    this.navbarService.setShowNavbar(true);

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



}
