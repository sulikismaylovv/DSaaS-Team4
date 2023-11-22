import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.css']
})
export class TeamComponent {
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
}
