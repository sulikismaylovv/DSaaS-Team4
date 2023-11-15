import { Component } from '@angular/core';
import {ThemeService} from "../../core/services/theme.service";
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  constructor(public themeService: ThemeService) {}
  toggleTheme() {
    this.themeService.toggleTheme();
  }



}
