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
import {PreferencesService} from "../../../core/services/preference.service";
import {Preference} from "../../../core/services/preference.service";

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
  nextFixture: SupabaseFixture = new SupabaseFixtureModel();
  nextClub: Club = new Club();
  myClub: Club = new Club();
  clubID: number = 0;

  constructor(
    public themeService: ThemeService,
    public navbarService: NavbarService,
    private router: Router,
    protected readonly authService: AuthService,
    private preferencesService: PreferencesService,
    protected readonly userService: UserServiceService,
    protected readonly imageDownloadService: ImageDownloadService,
    private fixtureTransferService: FixtureTransferService,
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {
  }
  ngOnInit() {
    this.navbarService.setShowNavbar(true);
    this.getStanding()
      .then(() => this.getClubID())
      .then(() => this.getNextFixture(this.clubID));
  }

  bindClubData(clubData: any): Club {
    // Assuming clubData has properties that match those in your Club model
    let club = new Club();
    club.id = clubData.id;
    club.name = clubData.name;
    club.logo = clubData.logo;
    // ... assign other properties as necessary

    return club;
  }

  getNextOpponentClub(): Club {
    if (!this.nextFixture) {
      console.error('Next fixture is not set');
      return new Club(); // or handle this case as per your application's logic
    }

    if (this.nextFixture.club0?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club1);
    } else if (this.nextFixture.club1?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club0);
    } else {
      console.error('Favorite club is not part of the next fixture');
      return new Club(); // or handle this case as per your application's logic
    }
  }

  getMyClub(): Club {
    if (!this.nextFixture) {
      console.error('Next fixture is not set');
      return new Club(); // or handle this case as per your application's logic
    }

    if (this.nextFixture.club0?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club0);
    } else if (this.nextFixture.club1?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club1);
    } else {
      console.error('Favorite club is not part of the next fixture');
      return new Club(); // or handle this case as per your application's logic
    }

  }

  goToFixture(){
    this.router.navigate(['/game', this.nextFixture.fixtureID]);
  }

  async getClubID() {
    try {
      const userId = this.authService.session?.user?.id;
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      this.clubID = await this.preferencesService.getFavoriteClub(userId);
      console.log("Club ID", this.clubID);
    } catch (error) {
      console.error('Error', error);
    }
  }

   formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Remove the time part for accurate comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
  
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      // Format the date as "Dec 16"
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  async getNextFixture(clubID: number) {
    try {
      this.nextFixture =(await this.apiService.testFunction(clubID))[0];
      console.log("This. nect ficture", this.nextFixture);
    } catch (error) {
      console.error('Error fetching next fixture:', error);
    }
    this.nextClub = this.getNextOpponentClub();
    this.myClub = this.getMyClub();
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
