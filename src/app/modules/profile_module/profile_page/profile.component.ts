import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonComponent} from "../common/common.component";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {BgImageSelectorComponent} from "../bg-image-selector/bg-image-selector.component";



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends CommonComponent {

  openCreatePostModal(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '700px',
      data: 0
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openBgImageSelectorModal(): void {
    const dialogRef = this.dialog.open(BgImageSelectorComponent, {
      width: '700px',
      data: 0
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
