import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../core/services/auth.service";
import { Session } from "@supabase/supabase-js";
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserServiceService } from "../../../core/services/user-service.service";
import { FriendsLeague, FriendsLeagueInterface, EnhancedUserInFriendsLeague } from "../../../core/services/friends-league.service";
import { ImageDownloadService } from "../../../core/services/imageDownload.service";
import { SafeResourceUrl } from "@angular/platform-browser";
import { CreatefriendsleagueService } from "../../../core/services/createfriendsleague.service";
import {BetsService} from "../../../core/services/bets.service";
import {SupabaseService} from "../../../core/services/supabase.service";

interface Friend {
  username: string;
}

@Component({
  selector: 'app-friendsleague',
  templateUrl: './friendsleague.component.html',
  styleUrls: ['./friendsleague.component.css']
})
export class FriendsleagueComponent implements OnInit {
  loading = true;
  leagueForm: FormGroup;
  currentUserID: string | undefined;
  leagueIds: number[] = [];
  leagues: FriendsLeagueInterface[] = [];
  leagueMembers: { [key: number]: EnhancedUserInFriendsLeague[] } = {};
  searchUsername = '';
  userSearchResults: any[] = [];
  protected session: Session | null | undefined;
  currentLeagueIndex = 0;

  constructor(
    private friendsLeague: FriendsLeague,
    private userService: UserServiceService,
    private readonly authService: AuthService,
    private readonly imageDownloadService: ImageDownloadService,
    private leagueService: CreatefriendsleagueService,
    private fb: FormBuilder,
    private betsService: BetsService,
    private readonly supabaseService: SupabaseService

  ) {
    this.leagueForm = this.fb.group({
      leagueName: ['', Validators.required],
      friends: this.fb.array([])
    });

    this.supabaseService.supabaseClient
      .channel('league_updates')
      .on('postgres_changes',
        {
        event: '*',
        schema: 'public',
        table: 'usersinfriendsleague',
        },
        async () => {
          await this.ngOnInit();
        }
      )
      .subscribe();


    this.supabaseService.supabaseClient
      .channel('league_updates2')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendsleagues',
        },
        async () => {
          await this.ngOnInit();
        }
      )
      .subscribe();
  }

  async ngOnInit() {
    this.loading = true;
    this.authService.authChanges((_, session) => (this.session = session));
    try {
      const user = this.authService.session?.user;
      this.currentUserID = user?.id;
      this.leagueIds = await this.friendsLeague.getLeaguesIDForCurrentUser();
      this.leagues = await this.friendsLeague.getLeaguesByIds(this.leagueIds);
      this.loading = false;

      for (const leagueId of this.leagueIds) {
        const members = await this.friendsLeague.getMembersForLeagues([leagueId]);
        this.leagueMembers[leagueId] = await Promise.all(members[leagueId].map(async (member) => {
          const username = await this.userService.getUsernameByID(member.userid);
          const avatarSafeUrl: SafeResourceUrl | undefined = await this.imageDownloadService.loadAvatarImage(member.userid);
          return { ...member, username, avatarSafeUrl } as EnhancedUserInFriendsLeague;
        }));
      }
    } catch (error) {
      console.error('Error loading the leagues and their members:', error);
    } finally {
      this.loading = false;
    }
  }

  async onUserSearch(event: any): Promise<void> {
    const searchTerm = event.target.value;
    if (searchTerm.length > 2) { // Trigger search when at least 3 characters are typed
      const results = await this.userService.searchFriendsByUsername(searchTerm);
      // Filter out usernames that have already been added
      const addedUsernames = this.friends.value.map((f: Friend) => f.username);
      this.userSearchResults = results.filter((user: { username: any; }) => !addedUsernames.includes(user.username));
    } else {
      this.userSearchResults = [];
    }
  }

  get friends(): FormArray {
    return this.leagueForm.get('friends') as FormArray;
  }

  async addUserToLeague(userId: string , leagueId: number): Promise<void> {
    try {
      await this.leagueService.addUserToLeague(userId, leagueId);
    } catch (error) {
      console.error('Error adding user to league:', error);
    }
  }

  createFriendGroup(username = ''): FormGroup {
    return this.fb.group({
      username: [username, Validators.required]
    });
  }

  addFriend(username = ''): void {
    if (username.trim()) {
      const isAlreadyAdded = this.friends.value.some((f: Friend) => f.username === username);
      if (!isAlreadyAdded) {
        this.friends.push(this.createFriendGroup(username));
      }
    }
  }

  removeFriend(index: number): void {
    this.friends.removeAt(index);
  }

  getCurrentlyAddedUsernames(): string[] {
    if (this.currentLeagueIndex >= 0 && this.currentLeagueIndex < this.leagues.length) {
      const currentLeague = this.leagues[this.currentLeagueIndex];

      // Check if currentLeague is defined and has a valid id
      if (currentLeague && currentLeague.id !== undefined) {
        const currentLeagueId = currentLeague.id;
        const members = this.leagueMembers[currentLeagueId];

        if (members) {
          return members.map(member => member.username);
        }
      }
    }
    return [];
  }
  async addAndClear(username: string, inputElement: HTMLInputElement): Promise<void> {
    console.log("addAndClear called with username:", username);

    if (username.trim()) {
      const user = this.userSearchResults.find(user => user.username === username);
      console.log("Found user in search results:", user);

      const currentLeague = this.leagues[this.currentLeagueIndex];
      //console.log("Current league:", currentLeague);
      //console.log('isAlreadyAdded:', this.isAlreadyAdded(user.id));

      if (user && currentLeague?.id !== undefined && !this.isAlreadyAdded(user.id)) {
        try {
          //console.log("Fetching betterID for userID:", user.id);
          const betterID = await this.betsService.getBetterID(user.id);
          //console.log("Retrieved betterID:", betterID);

          if (betterID !== 0) {
            //console.log("Fetching XP for betterID:", betterID);
            const userXP = await this.betsService.getUserXP(user.id);
            console.log("Retrieved XP:", userXP);

            if (userXP !== null) {
              console.log("Adding user to league:", currentLeague.id, "with XP:", userXP);
              await this.leagueService.addUserToLeague(user.id, currentLeague.id, userXP);

              const updatedMember = { ...user, username: user.username, xp: userXP };
              this.leagueMembers[currentLeague.id].push(updatedMember);

              this.userSearchResults = [];
              console.log("User added successfully. Updated league members:", this.leagueMembers[currentLeague.id]);
            }
          }
        } catch (error) {
          console.error('Error adding user to league:', error);
        }
      } else {
        console.log("User is either not found, already added, or currentLeagueId is undefined");
        alert("User is either not found, already added, or currentLeagueId is undefined");
        this.userSearchResults = [];
        inputElement.value = '';
      }
      inputElement.value = '';
    } else {
      //console.log("Username is empty after trimming");
    }
  }


  isAlreadyAdded(userId: string): boolean {
    // Check if currentLeagueIndex is within the bounds of the leagues array
    if (this.currentLeagueIndex >= 0 && this.currentLeagueIndex < this.leagues.length) {
      const currentLeagueId = this.leagues[this.currentLeagueIndex]?.id;

      // Ensure that currentLeagueId is defined
      if (currentLeagueId !== undefined) {
        // Check if the userId is already in the league members list
        return this.leagueMembers[currentLeagueId]?.some(member => member.userid === userId) ?? false;
      }
    }
    return false;
  }



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
