import {Component, OnInit} from '@angular/core';

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
  leagueName = 'Gold'; // Example league name
  comingSoonDate: Date = new Date('2023-12-31T23:59:59'); // Set your coming soon date here
  countdown: any;

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
    this.startCountdown();
  }

  startCountdown() {
    this.countdown = setInterval(() => {
      const now = new Date();
      const distance = this.comingSoonDate.getTime() - now.getTime();

      if (distance < 0) {
        clearInterval(this.countdown);
        this.countdown = null;
      } else {
        this.updateCountdown(distance);
      }
    }, 1000);
  }

  updateCountdown(distance: number) {
    // Calculate days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update the view with the new countdown
    this.countdown = { days, hours, minutes, seconds };
  }
}
