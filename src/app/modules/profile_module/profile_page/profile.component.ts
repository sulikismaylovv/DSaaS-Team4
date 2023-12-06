import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonComponent} from "../common/common.component";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends CommonComponent {

  openCreatePostModal(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '700px',
      panelClass: 'custom-dialog', // Use a custom CSS class for styling
      data: 0
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
