import { Component } from '@angular/core';

@Component({
  selector: 'app-registeration',
  templateUrl: './registeration.component.html',
  styleUrls: ['./registeration.component.css']
})
export class RegisterationComponent {
  selectedClubs: string[] = [];
  displayedClubs: string = '';

  displaySelectedClubs(): void {
    this.displayedClubs = 'You selected: ' + this.selectedClubs.join(', ');
  }
}
