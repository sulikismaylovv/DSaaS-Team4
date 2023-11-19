import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  showContent: boolean = false;
  clickedImage: string | null = null;
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
