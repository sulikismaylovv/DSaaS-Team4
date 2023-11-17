import { Component, OnInit } from '@angular/core';

// Add the User interface here
interface User {
  username: string;
  points: number;

  profilePictureUrl: string;
}

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css']
})
export class LeagueComponent implements OnInit {
  leagueName: string = 'Gold'; // Example league name

  // Initialize the users with an array of User objects
  users: User[] = [
    { username: 'fares', points: 120, profilePictureUrl: 'assets/images/Default.svg'}, // Example user with points
    { username: 'abdo', points: 200, profilePictureUrl: 'assets/images/Default.svg' },
    { username: 'kasper', points: 170, profilePictureUrl: 'assets/images/Default.svg' },   // Another example user with points
    { username: 'chrysovalantis', points: 180, profilePictureUrl: 'assets/images/Default.svg' },   // Another example user with points
    { username: 'suleyman', points: 190, profilePictureUrl: 'assets/images/Default.svg' }  , // Another example user with points
    { username: 'ivan', points: 150 , profilePictureUrl: 'assets/images/Default.svg'}  ,
    { username: 'kasper', points: 170 , profilePictureUrl: 'assets/images/Default.svg'},   // Another example user with points
    { username: 'chrysovalantis', points: 180 , profilePictureUrl: 'assets/images/Default.svg'},   // Another example user with points
    { username: 'suleyman', points: 190 , profilePictureUrl: 'assets/images/Default.svg'}  , // Another example user with points
  ];

  // Sort users by points
  get usersSortedByPoints() {
    // Copy the users array and sort it to avoid mutating the original array
    return this.users.slice().sort((a, b) => b.points - a.points);
  }

  ngOnInit() {
    // Your initialization logic here
  }
}
