import {Component, OnInit} from '@angular/core';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {FriendshipService} from "../../../core/services/friendship.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {SupabaseService} from "../../../core/services/supabase.service";

interface FriendRequest {
  profile: Profile;
  avatarSafeUrl: SafeResourceUrl;
  createdAt?: Date;
}


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {
  currentUserId: string | undefined = this.authService.session?.user.id;
  friendRequests: FriendRequest[] = []; // Example data, replace with actual friend request data

  constructor(
    private readonly authService: AuthService,
    private readonly friendshipService: FriendshipService,
    private readonly imageService: ImageDownloadService,
    private readonly supabase: SupabaseService
  ) {
    this.supabase.supabaseClient
      .channel('realtime-friendships')
      .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friendships',
      },
        () => {
          this.fetchRequests(this.currentUserId).then(r =>
          window.location.reload());
        }
      ).subscribe()

  }

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.session?.user.id;
    await this.fetchRequests(this.currentUserId);
  }

  async acceptRequest(userId: string | undefined): Promise<void> {
    if (userId === undefined && this.currentUserId === undefined) throw new Error('User ID is undefined');
    console.log('Accepted request from:', userId);
    await this.friendshipService.updateFriendRequest(<string>this.currentUserId, <string>userId, 'accepted');
    // Handle accept request logic
    window.location.reload();
  }

  async declineRequest(userId: string | undefined): Promise<void> {
    if (userId === undefined && this.currentUserId === undefined) throw new Error('User ID is undefined');
    console.log('Rejected request from:', userId);
    await this.friendshipService.updateFriendRequest(<string>this.currentUserId, <string>userId, 'rejected');
    // Handle accept request logic
    window.location.reload();

  }
  async fetchRequests(userId: string | undefined): Promise<void> {
    if (userId === undefined) throw new Error('User ID is undefined');
    if (userId) {
      const requests = await this.friendshipService.getFriendRequests(userId);
      for (const request of requests) {
        const requestProfile = await this.authService.profileById(request.user1_id);
        if (requestProfile.data) {
          const avatarSafeUrl = await this.imageService.loadAvatarImage(requestProfile.data.id);
          this.friendRequests.push({
            profile: requestProfile.data,
            avatarSafeUrl: avatarSafeUrl || '/assets/default-avatar.png', // Fallback to default image
            createdAt: request.created_at
          });
        }
      }
    }
  }

}
