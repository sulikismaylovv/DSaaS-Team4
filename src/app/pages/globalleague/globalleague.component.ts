import { Component } from '@angular/core';

@Component({
  selector: 'app-globalleague',
  templateUrl: './globalleague.component.html',
  styleUrls: ['./globalleague.component.css']
})
export class GloballeagueComponent {
  currentView: 'global' | 'friends' = 'global';

}
