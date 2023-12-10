import {Component, OnInit} from '@angular/core';
import {
  FriendsLeagueInterface,
  FriendsLeague,
  EnhancedUserInFriendsLeague
} from "../../../core/services/friends-league.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {AuthService} from "../../../core/services/auth.service";
import {Session} from "@supabase/supabase-js";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";

@Component({
  selector: 'app-friendsleague',
  templateUrl: './friendsleague.component.html',
  styleUrls: ['./friendsleague.component.css']
})
export class FriendsleagueComponent implements OnInit{

  loading = true;

  currentUserID: string | undefined;
  leagueIds: number[] = [];

  leagues: FriendsLeagueInterface[] = [];
  // username: string = '';
  leagueMembers: { [key: number]: EnhancedUserInFriendsLeague[] } = {};
  protected session: Session | null | undefined;
  constructor(private friendsLeague: FriendsLeague,
              private userService: UserServiceService,
              private readonly authService: AuthService,
              private readonly imageDonwloadService: ImageDownloadService) {}

  async ngOnInit() {
    this.loading = true; // Start with loading set to true
    this.authService.authChanges((_, session) => (this.session = session));
    try {
      const user = this.authService.session?.user;
      this.currentUserID = user?.id;
      //console.log("current user id : ", this.currentUserID);

      // Get the league IDs for the current user
      this.leagueIds = await this.friendsLeague.getLeaguesIDForCurrentUser();

      // Get the details of these leagues
      this.leagues = await this.friendsLeague.getLeaguesByIds(this.leagueIds);
      //console.log("Leagues: ", this.leagues);
        this.loading = false; // Set loading to false when the data is loaded

      // Get the members for each league
      for (const leagueId of this.leagueIds) {
        const members = await this.friendsLeague.getMembersForLeagues([leagueId]);
        this.leagueMembers[leagueId] = await Promise.all(members[leagueId].map(async (member) => {
          // Get the username for each user ID
          const username = await this.userService.getUsernameByID(member.userid);
          // Get the avatar for each user ID
          const avatarSafeUrl: SafeResourceUrl | undefined = await this.imageDonwloadService.loadAvatarImage(member.userid);
          return { ...member, username , avatarSafeUrl} as EnhancedUserInFriendsLeague;
        }));
      }
    } catch (error) {
      console.error('There was an error loading the leagues and their members:', error);
    } finally {
      this.loading = false; // Set loading to false when the data is loaded
    }
  }


  currentLeagueIndex = 0;
  moveToNextLeague() {
    this.currentLeagueIndex = (this.currentLeagueIndex + 1) % this.leagues.length;
  }

  moveToPreviousLeague() {
    this.currentLeagueIndex = (this.currentLeagueIndex - 1 + this.leagues.length) % this.leagues.length;
  }

  isCurrentUser(memberUserID: string): boolean {
    return this.currentUserID === memberUserID;
  }
}
