import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-helppage',
  templateUrl: './helppage.component.html',
  styleUrls: ['./helppage.component.css']
})
export class HelppageComponent {
  @Input() question: string = '';
  @Input() answer: string = '';
  isOpen = false;
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
