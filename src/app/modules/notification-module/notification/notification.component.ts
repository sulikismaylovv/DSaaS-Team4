import {Component, OnInit} from '@angular/core';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {FriendshipService} from "../../../core/services/friendship.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {SupabaseService} from "../../../core/services/supabase.service";
import {NotificationService , Notification} from "../../../core/services/notifications.service";


interface FriendRequest {
  profile: Profile;
  avatarSafeUrl: SafeResourceUrl;
  createdAt: Date;
}

interface CombinedNotification {
  id?: number | string;
  title?: string;
  text?: string;
  avatarSafeUrl?: SafeResourceUrl;
  createdAt: Date ;
  type: 'friendRequest' | 'bettingNotification'; // Add more types as necessary
  profile?: Profile;
}




@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {
  friendRequests: FriendRequest[] = []; // Example data, replace with actual friend request data
  currentUserId: string | undefined = this.authService.session?.user.id;
  allNotifications: CombinedNotification[] = [];
  categorizedNotifications: { [key: string]: CombinedNotification[] } = {};


  constructor(
    private readonly authService: AuthService,
    private readonly friendshipService: FriendshipService,
    private readonly imageService: ImageDownloadService,
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationService,
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
          this.fetchRequests().then(r =>
          window.location.reload());
        }
      ).subscribe()

  }


  // Fetch all types of notifications for the user
  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.session?.user.id;
    await Promise.all([this.fetchNotifications(), this.fetchRequests()]);
    this.categorizeNotifications();
  }

  async fetchNotifications(): Promise<void> {
    if (this.currentUserId) {
      const notifications = await this.notificationService.getNotificationsForUser(this.currentUserId);
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        text: notification.text,
        createdAt: new Date(notification.created_at || Date.now()),
        type: 'bettingNotification' as 'bettingNotification'
      }));
      this.allNotifications.push(...formattedNotifications);
    }
  }

  async fetchRequests(): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User ID is undefined');
    }

    const requests = await this.friendshipService.getFriendRequests(this.currentUserId);

    // Process each friend request and add to the allNotifications list
    for (const request of requests) {
      const requestProfile = await this.authService.profileById(request.user1_id);
      if (requestProfile.data) {
        const avatarUrl = await this.imageService.loadAvatarImage(requestProfile.data.id);
        const formattedRequest: CombinedNotification = {
          id: 'fr' + requestProfile.data.id, // Use a unique prefix
          text: `${requestProfile.data.username} wants to be your friend`,
          title: 'Friend Request',
          avatarSafeUrl: avatarUrl || '/assets/default-avatar.png', // Fallback to default image if loadAvatarImage fails
          createdAt: new Date(request.created_at), // Ensure createdAt is a Date object
          type: 'friendRequest',
          profile: requestProfile.data, // Include the profile data
        };
        this.allNotifications.push(formattedRequest);
      }
    }
  }

  categorizeNotifications(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const notification of this.allNotifications) {
      const createdAt = new Date(notification.createdAt); // Make sure createdAt is a Date object
      const category = createdAt >= today ? 'today'
        : createdAt >= yesterday ? 'yesterday' : 'older';

      if (!this.categorizedNotifications[category]) {
        this.categorizedNotifications[category] = [];
      }
      this.categorizedNotifications[category].push(notification);
    }
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
  // async fetchRequests(userId: string | undefined): Promise<void> {
  //   if (userId === undefined) throw new Error('User ID is undefined');
  //   if (userId) {
  //     const requests = await this.friendshipService.getFriendRequests(userId);
  //     for (const request of requests) {
  //       const requestProfile = await this.authService.profileById(request.user1_id);
  //       if (requestProfile.data) {
  //         const avatarSafeUrl = await this.imageService.loadAvatarImage(requestProfile.data.id);
  //         this.friendRequests.push({
  //           profile: requestProfile.data,
  //           avatarSafeUrl: avatarSafeUrl || '/assets/default-avatar.png', // Fallback to default image
  //           createdAt: request.created_at
  //         });
  //       }
  //     }
  //   }
  // }

}
