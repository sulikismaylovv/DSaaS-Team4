import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-helppage',
  templateUrl: './helppage.component.html',
  styleUrls: ['./helppage.component.css']
})
export class HelppageComponent {
  @Input() question = '';
  @Input() answer = '';
  isOpen = false;
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
