// src/app/pages/createleague/createleague.component.ts

import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserServiceService} from "../../core/services/user-service.service";
import {CreatefriendsleagueService, League} from "../../core/services/createfriendsleague.service";
import {AuthService} from "../../core/services/auth.service";

interface Friend {
  username: string;
}

@Component({
  selector: 'app-createleague',
  templateUrl: './createleague.component.html',
  styleUrls: ['./createleague.component.css']
})
export class CreateleagueComponent implements OnInit {
  leagueForm: FormGroup;
  showModal: boolean = false;
  submittedLeagueName: string = '';
  submittedFriendsUsernames: string[] = [];
  userSearchResults: any[] = [];


  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private userService: UserServiceService,
              private leagueService: CreatefriendsleagueService) {
    this.leagueForm = this.fb.group({
      leagueName: ['', Validators.required],
      friends: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  createFriendGroup(username: string = ''): FormGroup {
    return this.fb.group({
      username: [username, Validators.required]
    });
  }

  addFriend(username: string = ''): void {
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
          this.showModal = true;
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

  closeModal(): void {
    this.showModal = false;
  }

  addAndClear(username: string, inputElement: HTMLInputElement): void {
    if (username.trim()) {
      // Add the friend to the friends list
      this.friends.push(this.createFriendGroup(username));
      // Clear the search results array
      this.userSearchResults = [];
      // Clear the input field
      inputElement.value = '';
    }
  }

  // Optional: Add a method for user search if you have an input field for it
  async onUserSearch(event: any): Promise<void> {
    const searchTerm = event.target.value;
    if (searchTerm.length > 2) { // Trigger search when at least 3 characters are typed
      this.userSearchResults = await this.userService.searchUserByUsername(searchTerm);
    } else {
      this.userSearchResults = [];
    }
  }
}
