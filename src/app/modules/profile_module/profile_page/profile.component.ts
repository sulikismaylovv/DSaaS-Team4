import {Component} from '@angular/core';
import { CommonComponent} from "../common/common.component";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {BgImageSelectorComponent} from "../bg-image-selector/bg-image-selector.component";



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends CommonComponent {
  editPencil: string[]= ['edit-pencil-primary-100.svg', 'edit-pencil-light-mode-text.svg'];

  openCreatePostModal(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '900px',
      data: 0
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  openBgImageSelectorModal(): void {
    const dialogRef = this.dialog.open(BgImageSelectorComponent, {
      width: '900px',
      data: this.profile,
      panelClass: 'mat-dialog-container',
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

}
