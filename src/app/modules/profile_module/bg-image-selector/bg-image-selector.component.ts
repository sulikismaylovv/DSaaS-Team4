import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {SafeResourceUrl} from "@angular/platform-browser";
import {CommonComponent} from "../common/common.component";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";

@Component({
  selector: 'app-bg-image-selector',
  templateUrl: './bg-image-selector.component.html',
  styleUrls: ['./bg-image-selector.component.css']
})
export class BgImageSelectorComponent implements OnInit{
  uploading = false;
  _bgImageUrl: SafeResourceUrl | undefined;
  @Output() bgImageUpload = new EventEmitter<string>();




  constructor(
    protected readonly authService: AuthService,
    protected readonly imageService: ImageDownloadService,
    @Inject(MAT_DIALOG_DATA) public data: Profile,

  ) {
    }

  async ngOnInit(): Promise<void> {
    console.log(this.data);
    this._bgImageUrl = await this.imageService.loadBackgroundImage(this.data.id);
  }


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
      this.bgImageUpload.emit(filePath);
      this._bgImageUrl = await this.imageService.loadBackgroundImage(this.data.id);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.uploading = false;
    }
  }

}

