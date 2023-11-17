// src/app/pages/createleague/createleague.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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

  onSubmit(): void {
    if (this.leagueForm.valid) {
      this.submittedLeagueName = this.leagueForm.value.leagueName;
      this.submittedFriendsUsernames = this.leagueForm.value.friends.map((f: Friend) => f.username);
      this.showModal = true; // Show the modal with the information
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Update this method to only take a string argument
  addAndClear(username: string, inputElement: HTMLInputElement): void {
    if (username.trim()) { // Check if username is not just empty spaces
      this.friends.push(this.createFriendGroup(username));
      inputElement.value = ''; // Clear the input field
    }
  }
}
