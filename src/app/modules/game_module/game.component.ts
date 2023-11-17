import { Component } from '@angular/core';
import {ThemeService} from "../../core/services/theme.service";
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  showContent: boolean = false;
  clickedImage: string | null = null;
  constructor(public themeService: ThemeService) {}
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  toggleContent(team: string){
    if (this.clickedImage === team) {
      // If the same team is clicked again, reset everything
      this.showContent = false;
      this.clickedImage = null;
    } else {
      // Otherwise, show content and set the clicked team
      this.showContent = true;
      this.clickedImage = team;
    }
  }
}
