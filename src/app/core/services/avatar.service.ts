// avatar.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserServiceService } from './user-service.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private userService: UserServiceService
  ) {}

  async loadAvatarImage(userId: string | undefined): Promise<SafeResourceUrl | undefined> {
    if (userId === undefined) throw new Error('User ID is undefined');
    try {
      const avatarUrl = await this.getAvatarUrlByID(userId);
      const { data } = await this.authService.downLoadImage(avatarUrl);
      if (data instanceof Blob) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
      }
      return undefined;
    } catch (error) {
      console.error('Error downloading avatar:', error);
      return undefined;
    }
  }

  async getAvatarUrlByID(id: string) {
    return this.userService.getUserByID(id).then(user => {
      return user.avatar_url;

    }).catch(error => {
      console.error('Could not fetch avatar_url', error);
    });
  }
}
