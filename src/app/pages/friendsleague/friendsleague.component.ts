import { Component } from '@angular/core';
import {
  FriendsLeagueInterface,
  FriendsLeague,
  UserInFriendsLeague
} from "../../core/services/friends-league.service";
import {UserServiceService} from "../../core/services/user-service.service";

@Component({
  selector: 'app-friendsleague',
  templateUrl: './friendsleague.component.html',
  styleUrls: ['./friendsleague.component.css']
})
export class FriendsleagueComponent {
  leagueIds: number[] = [];
  leagues: FriendsLeagueInterface[] = [];
  leagueMembers: { [key: number]: UserInFriendsLeague[] } = {};
  constructor(private friendsLeague: FriendsLeague,
              private userService: UserServiceService) {}

  async ngOnInit() {
    try {
      // Get the league IDs for the current user
      this.leagueIds = await this.friendsLeague.getLeaguesIDForCurrentUser();

      // Get the details of these leagues
      this.leagues = await this.friendsLeague.getLeaguesByIds(this.leagueIds);

      // Get the members for each league
      for (const leagueId of this.leagueIds) {
        const members = await this.friendsLeague.getMembersForLeagues([leagueId]);
        this.leagueMembers[leagueId] = await Promise.all(members[leagueId].map(async (member) => {
          // Get the username for each user ID
          const username = await this.userService.getUsernameByID(member.userid);
          return { ...member, username };
        }));
      }
    } catch (error) {
      console.error('There was an error loading the leagues and their members:', error);
    }
  }
}
