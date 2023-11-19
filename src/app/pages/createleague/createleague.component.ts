// src/app/pages/createleague/createleague.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {UserServiceService} from "../../core/services/user-service.service";
import {CreatefriendsleagueService} from "../../core/services/createfriendsleague.service";

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
    console.log('onSubmit called'); // Initial log to indicate function is called
    if (this.leagueForm.valid) {
      const leagueName = this.leagueForm.value.leagueName;
      console.log(`Form is valid, league name is: ${leagueName}`); // Log the league name
      const friendsUsernames: string[] = this.leagueForm.value.friends.map((f: Friend) => f.username);
      console.log(`Friends to add: ${friendsUsernames.join(', ')}`); // Log friends usernames

      try {
        // Create league and get the ID
        console.log('Attempting to create league...');
        const leagueId = await this.leagueService.createLeague(leagueName);
        console.log(`League created with ID: ${leagueId}`); // Log the league ID after creation

        if (leagueId) {
          for (const username of friendsUsernames) {
            console.log(`Searching for user: ${username}`);
            const users = await this.userService.searchUserByUsername(username);
            console.log(`Found users: ${JSON.stringify(users)}`); // Log found users
            if (users.length > 0) {
              console.log(`Adding user ${users[0].id} to league ${leagueId}`);
              await this.leagueService.addUserToLeague(users[0].id, leagueId);
              console.log(`User ${users[0].id} added to league`);
            }
          }

          this.submittedLeagueName = leagueName;
          this.submittedFriendsUsernames = friendsUsernames;
          this.showModal = true;
          console.log('League and users processed successfully');
        } else {
          console.error('Failed to create league, leagueId is undefined.');
        }
      } catch (error) {
        console.error('Error caught in onSubmit:', error);
      }
    } else {
      console.log('Form is not valid, submission aborted.');
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
