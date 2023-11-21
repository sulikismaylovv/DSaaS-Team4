import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  showContent: boolean = false;
  clickedImage: string | null = null;
  @Input() team: any;
  @Input() selected: boolean = false;
  @Input() favorite: boolean = false; // Add this line to represent a favorite team
  @Output() selectTeam = new EventEmitter<any>();
  hover: boolean = false;

  toggleSelection() {
    // If you want to prevent changing the selection of the favorite team,
    // you can add a condition here:
    if (!this.favorite) {
      this.selectTeam.emit(this.team);
    }
  }
  toggleContent(team: string) {
    if (this.clickedImage === team) {
      // If the same team is clicked again, reset everything
      this.showContent = false;
      this.clickedImage = null;
    } else {
      // Otherwise, show content and set the clicked team
      this.showContent = true;
      this.clickedImage = team;


    }}

}
