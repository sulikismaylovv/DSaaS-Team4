import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SafeResourceUrl} from "@angular/platform-browser";
import {CommonComponent} from "../common/common.component";

@Component({
  selector: 'app-bg-image-selector',
  templateUrl: './bg-image-selector.component.html',
  styleUrls: ['./bg-image-selector.component.css']
})
export class BgImageSelectorComponent extends CommonComponent implements OnInit{
  uploading = false;
  @Input() _bgImageUrl: SafeResourceUrl | undefined;
  @Output() bgImageUpload = new EventEmitter<string>();

  async uploadBgImage(event: any) {
    try {
      this.uploading = true;
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      // Additional logic to handle cropping and zooming should go here

      // Upload logic
      // Assuming you have a method similar to uploadAvatar for background images
      const filePath = `${Math.random()}.${file.type.split('/')[1]}`;
      await this.authService.uploadBackground(filePath, file); // Adjust this method according to your service
      await this.authService.updateUser({background: filePath}); // Adjust this method according to your service
      console.log('Uploaded file: ', filePath);
      this.bgImageUpload.emit(filePath);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.uploading = false;
    }
  }


}

