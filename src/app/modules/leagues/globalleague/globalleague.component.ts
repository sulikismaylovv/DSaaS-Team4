import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/services/auth.service";
import {Session} from "@supabase/supabase-js";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserServiceService} from "../../../core/services/user-service.service";
import {CreatefriendsleagueService, League} from "../../../core/services/createfriendsleague.service";


interface Friend {
  username: string;
}
@Component({
  selector: 'app-globalleague',
  templateUrl: './globalleague.component.html',
  styleUrls: ['./globalleague.component.css']
})
export class GloballeagueComponent implements OnInit {
  currentView: 'regional' | 'friends' = 'friends';
  private session: Session | null | undefined;
  showModal = false;

  leagueForm: FormGroup;
  showModalConfirm = false;
  submittedLeagueName = '';
  submittedFriendsUsernames: string[] = [];
  userSearchResults: any[] = [];


  constructor(
    private fb: FormBuilder,
    private  authService: AuthService,
    private userService: UserServiceService,
    private leagueService: CreatefriendsleagueService ){  this.leagueForm = this.fb.group({
    leagueName: ['', Validators.required],
    friends: this.fb.array([])
  });
    }


  ngOnInit(): void {
    this.authService.authChanges((_, session) => (this.session = session));
    console.log(this.session);
  }


  createFriendGroup(username = ''): FormGroup {
    return this.fb.group({
      username: [username, Validators.required]
    });
  }

  addFriend(username = ''): void {
    this.friends.push(this.createFriendGroup(username));
  }

  get friends(): FormArray {
    return this.leagueForm.get('friends') as FormArray;
  }

  removeFriend(index: number): void {
    this.friends.removeAt(index);
  }
  async onSubmit(): Promise<void> {
    let leagueId;
    if (this.leagueForm.valid) {
      const leagueName = this.leagueForm.value.leagueName;
      const friendsUsernames = this.leagueForm.value.friends.map((f: Friend) => f.username);

      try {
        // Fetch the user ID of the league creator (assuming it's stored in the authService)
        const userId = this.authService.session?.user?.id;
        if (!userId) {
          console.error('User ID is not available. User must be logged in.');
          return;
        }

        // Create a League object
        const league: League = {
          name: leagueName,
          user_id: userId,
          created_at: new Date()
        };

        // Create league and get the ID
        leagueId = await this.leagueService.createLeague(league);
        console.log('leagueId:', leagueId);

        // Check if leagueId is a number before proceeding
        if (typeof leagueId === 'number') {
          const currentUserId = this.authService.session?.user?.id; // Get the current user's ID from the AuthService
          if (!currentUserId) {
            console.error('Current user ID is undefined.');
            // Handle the error appropriately, maybe by showing a user-friendly message
            return;
          }

          // Now that we have confirmed currentUserId is not undefined, we can call addUserToLeague
          await this.leagueService.addUserToLeague(currentUserId, leagueId);

          // For each username, search for the user and get their ID, then add to league
          for (const username of friendsUsernames) {
            const users = await this.userService.searchUserByUsername(username);
            if (users.length > 0) {
              await this.leagueService.addUserToLeague(users[0].id, leagueId);
            }
          }

          // Set submitted data for modal or success message
          this.submittedLeagueName = leagueName;
          this.submittedFriendsUsernames = friendsUsernames;
          this.showModalConfirm = true;
        } else {
          // Handle the case where leagueId is undefined
          console.error('Failed to create league.');
          // Optionally, show an error message to the user
        }
      } catch (error) {
        // Handle any errors
        console.error('Error creating league with users:', error);
        // Optionally, set an error message to display to the user
      }
    }
  }

  addAndClear(username: string, inputElement: HTMLInputElement): void {
    if (username.trim()) {
      // Check if the username is in the userSearchResults and not already added
      const userExists = this.userSearchResults.some(user => user.username === username);
      const isAlreadyAdded = this.friends.value.some((f: Friend) => f.username === username);

      if (userExists && !isAlreadyAdded) {
        // Add the friend to the friends list
        this.friends.push(this.createFriendGroup(username));
        // Clear the search results array
        this.userSearchResults = [];
      } else {
        // Handle the case where the username is not in userSearchResults
        // or already added to the friends list
        // For example, show an error message or do nothing
      }

      // Clear the input field
      inputElement.value = '';
    }
  }

  // Optional: Add a method for user search if you have an input field for it
  async onUserSearch(event: any): Promise<void> {
    const searchTerm = event.target.value;
    if (searchTerm.length > 2) { // Trigger search when at least 3 characters are typed
      let results = await this.userService.searchFriendsByUsername(searchTerm);
      // Filter out usernames that have already been added
      const addedUsernames = this.friends.value.map((f: Friend) => f.username);
      this.userSearchResults = results.filter((user: { username: any; }) => !addedUsernames.includes(user.username));
    } else {
      this.userSearchResults = [];
    }
  }

  closeModalConfirm(): void {
    this.showModalConfirm = false;
  }

}
