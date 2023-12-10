// imageDownload.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserServiceService } from './user-service.service';
import {PostsService} from "./posts.service";
import {PreferencesService} from "./preference.service";

@Injectable({
  providedIn: 'root'
})
export class ImageDownloadService {

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private userService: UserServiceService,
    private postService: PostsService,
    private preferenceService: PreferencesService
  ) {}

  async loadAvatarImage(userId: string | undefined): Promise<SafeResourceUrl> {
    // Define the path to the standard user logo
    const defaultAvatarPath = '../../assets/icons/Default_pfp.svg'; // Adjust the path as necessary

    if (userId === undefined) {
      // If userId is undefined, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultAvatarPath);
    }

    try {
      const avatarUrl = await this.getAvatarUrlByID(userId);
      if (avatarUrl) {
        const {data} = await this.authService.downLoadImage(avatarUrl);

        if (data instanceof Blob) {
          // If an avatar image is downloaded, use it
          return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));}
      }
      // If no avatar image is downloaded, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultAvatarPath);

    } catch (error) {
      console.error('Error downloading avatar:', error);
      // In case of any error, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultAvatarPath);
    }
  }

  async loadBackgroundImage(userId: string | undefined): Promise<SafeResourceUrl> {
    // Define the path to the standard user logo
    const defaultBackgroundPath = '../../assets/images/default-background.jpg'; // Adjust the path as necessary

    if (userId === undefined) {
      // If userId is undefined, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultBackgroundPath);
    }

    try {
      const backgroundUrl = await this.getBackgroundUrlByID(userId);
      if (backgroundUrl) {
        const {data} = await this.authService.downLoadBackground(backgroundUrl);

        if (data instanceof Blob) {
          // If an avatar image is downloaded, use it
          return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));}
      }
      // If no avatar image is downloaded, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultBackgroundPath);

    } catch (error) {
      console.error('Error downloading avatar:', error);
      // In case of any error, return the standard logo
      return this.sanitizer.bypassSecurityTrustResourceUrl(defaultBackgroundPath);
    }
  }

  async getAvatarUrlByID(id: string) {
    return this.userService.getUserByID(id).then(user => {
      return user.avatar_url;

    }).catch(error => {
      console.error('Could not fetch avatar_url', error);
    });
  }


  async loadPostImage(imageUrl: string): Promise<SafeResourceUrl | undefined> {
    try {
      const data = await this.postService.downLoadImage(imageUrl);
      if (data instanceof Blob) {
       return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
      }
      return undefined;
    } catch (error) {
      console.error('Error downloading image:', error);
      return undefined;
    }
  }

  async loadClubImage(imageUrl: string): Promise<SafeResourceUrl | undefined> {
    try {
      const data = await this.preferenceService.downLoadImage(imageUrl);
      if (data instanceof Blob) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
      }
      return undefined;
    } catch (error) {
      console.error('Error downloading image:', error);
      return undefined;
    }
  }

  private async getBackgroundUrlByID(userId: string) {
    return this.userService.getUserByID(userId).then(user => {
      return user.bg_url;

    }).catch(error => {
      console.error('Could not fetch background_url', error);
    });

  }
}
