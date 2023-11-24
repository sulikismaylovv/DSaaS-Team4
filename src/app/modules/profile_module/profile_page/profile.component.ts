import { Component } from '@angular/core';
import { CommonComponent} from "../common/common.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  commonInstance= new CommonComponent();
  userName: string= this.commonInstance.userName;
  actionString: string[]= ['Something', 'Edit'];
}
