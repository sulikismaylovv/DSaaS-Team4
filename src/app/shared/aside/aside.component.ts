import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserServiceService} from "../../core/services/user-service.service";
import {ImageDownloadService} from "../../core/services/imageDownload.service";
import {FixtureTransferService} from "../../core/services/fixture-transfer.service";
import {SupabaseFixture, SupabaseFixtureModel} from "../../core/models/supabase-fixtures.model";
import {ApiService} from "../../core/services/api.service";
import {Club} from "../../core/models/club.model";
import {PreferencesService} from "../../core/services/preference.service";

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.css']
})
export class AsideComponent implements OnInit {

  userSearchResults: any[] = [];
  session: any; // Adjust the type based on your session object
  hideForm = false;
  nextFixture: SupabaseFixture = new SupabaseFixtureModel();
  league: Club[] = [];

  nextClub: Club = new Club();
  myClub: Club = new Club();
  clubID = 0;

  constructor(
    protected readonly authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,

    private apiService: ApiService,
    private preferencesService: PreferencesService,
    protected readonly userService: UserServiceService,
    protected readonly imageDownloadService: ImageDownloadService,
    private fixtureTransferService: FixtureTransferService,




  ) { }

ngOnInit() {
  this.getStanding()
    .then(() => this.getClubID())
    .then(() => this.getNextFixture(this.clubID));
}

  async getClubID() {
    try {
      const userId = this.authService.session?.user?.id;
      if (!userId) {
        //console.error('User ID is undefined');
        return;
      }

      this.clubID = await this.preferencesService.getFavoriteClub(userId);
      //console.log("Club ID", this.clubID);
    } catch (error) {
      console.error('Error', error);
    }
  }

  async navigateToLogin() {
    await this.router.navigateByUrl('/login'); // Adjust the path as necessary for your app's route configuration
  }
  async redirectToProfile(userId: string): Promise<void> {
    await this.router.navigateByUrl(`/profile/${userId}`);
  }

  async getStanding() {
    const data = await this.apiService.fetchStandings();
    this.league = data;
    //console.log(this.league);
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

  goToFixture(){
    this.router.navigate(['/game', this.nextFixture.fixtureID]);
  }
  
  async getNextFixture(clubID: number) {
    try {
      const fixtures = await this.apiService.testFunction(clubID);
      const currentTime = new Date(); // Get the current time

      // Sort fixtures by time in ascending order
      const sortedFixtures = fixtures.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
      });

      // Find the first fixture that is starting now or in the future
      this.nextFixture = sortedFixtures.find(fixture => {
        const fixtureTime = new Date(fixture.time);
        return fixtureTime >= currentTime;
      })!;

      if (!this.nextFixture) {
        console.log("No upcoming fixtures found");
        return;
      }

      this.nextClub = this.getNextOpponentClub();
      this.myClub = this.getMyClub();
    } catch (error) {
      console.error('Error fetching next fixture:', error);
      return;
    }
  }





  getNextOpponentClub(): Club {
    if (!this.nextFixture) {
      return new Club(); // or handle this case as per your application's logic
    }

    if (this.nextFixture.club0?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club1);
    } else if (this.nextFixture.club1?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club0);
    } else {
      //console.error('Favorite club is not part of the next fixture');
      return new Club(); // or handle this case as per your application's logic
    }
  }

  getMyClub(): Club {
    if (!this.nextFixture) {
      //console.error('Next fixture is not set');
      return new Club(); // or handle this case as per your application's logic
    }

    if (this.nextFixture.club0?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club0);
    } else if (this.nextFixture.club1?.id === this.clubID) {
      return this.bindClubData(this.nextFixture.club1);
    } else {
      //console.error('Favorite club is not part of the next fixture');
      return new Club(); // or handle this case as per your application's logic
    }

  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();

    // Remove the time part for accurate comparison of dates
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
      // Format the time as "6:00 PM"
      return date.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
    } else {
      // Check if the date is tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowWithoutTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

      if (dateWithoutTime.getTime() === tomorrowWithoutTime.getTime()) {
        return 'Tomorrow';
      } else {
        // Format the date as "Dec 16"
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
      }
    }
  }

  bindClubData(clubData: any): Club {
    // Assuming clubData has properties that match those in your Club model
    const club = new Club();
    club.id = clubData.id;
    club.name = clubData.name;
    club.logo = clubData.logo;
    // ... assign other properties as necessary

    return club;
  }



}
