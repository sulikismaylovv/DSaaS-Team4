import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.css']
})
export class CustomAlertComponent {
  @Input() message: string = '';
  @Input() show: boolean = false;

  close() {
    this.show = false;
  }
}
