import {Component, OnInit} from '@angular/core';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {FriendshipService} from "../../../core/services/friendship.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {SupabaseService} from "../../../core/services/supabase.service";
import {NotificationsService} from "../../../core/services/notifications.service";
import {NavbarService} from "../../../core/services/navbar.service";




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
  logoType?: 'C' | 'U';

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
  public notificationsCount = 0;


  constructor(
    private readonly authService: AuthService,
    private readonly friendshipService: FriendshipService,
    private readonly imageService: ImageDownloadService,
    private readonly supabase: SupabaseService,
    private readonly notificationService: NotificationsService,
    private readonly navbarService: NavbarService
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
            this.categorizeNotifications())
          window.location.reload();}
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          this.fetchNotifications().then(r =>
            this.categorizeNotifications())
          window.location.reload();}
      )
      .subscribe()

  }


  // Fetch all types of notifications for the user
  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.session?.user.id;
    await Promise.all([this.fetchNotifications(), this.fetchRequests()]);
    await this.categorizeNotifications();
  }

  async fetchNotifications(): Promise<void> {
    if (this.currentUserId) {
      const notifications = await this.notificationService.getNotificationsForUser(this.currentUserId);
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        text: notification.text,
        createdAt: new Date(notification.created_at || Date.now()),
        type: 'bettingNotification' as const
      }));
      this.allNotifications.push(...formattedNotifications);
      this.allNotifications.forEach(notification => this.assignLogoType(notification));

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
        this.allNotifications.forEach(notification => this.assignLogoType(notification));

      }
    }
  }

  async categorizeNotifications(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const notification of this.allNotifications) {
      const createdAt = new Date(notification.createdAt);
      const category = createdAt >= today ? 'today'
          : createdAt >= yesterday ? 'yesterday' : 'older';

      if (!this.categorizedNotifications[category]) {
        this.categorizedNotifications[category] = [];
      }
      this.categorizedNotifications[category].push(notification);
    }

    // Sort notifications within each category by createdAt in descending order
    for (const category in this.categorizedNotifications) {
      this.categorizedNotifications[category].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    this.notificationsCount = this.allNotifications.length;
    this.navbarService.changeNotificationCount(0);
    await this.navbarService.setNotificationCount(this.currentUserId);
    await new Promise<void>((resolve) => {
      this.navbarService.currentNotificationCount$.subscribe((count) => {
        this.notificationsCount = count;
        resolve();
      });
    });
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

  async clearNotifications() {
    // Get all non-friend request notifications
    const nonFriendRequestNotifications = this.allNotifications.filter(notification => notification.type !== 'friendRequest');

    // Attempt to delete each notification from the database
    for (const notification of nonFriendRequestNotifications) {
      if (notification.id) { // Ensure the notification has an ID before attempting to delete
        const success = await this.notificationService.deleteNotification(<number>notification.id);
        if (!success) {
          console.error('Failed to delete notification with ID:', notification.id);
          // Optionally handle the error, e.g., by showing an error message to the user
        }
      }
    }

    // Remove the deleted notifications from the local state
    this.allNotifications = this.allNotifications.filter(notification => notification.type === 'friendRequest');
    // Re-categorize the remaining notifications
    window.location.reload();
  }

  shouldShowLogoC(text: string): boolean {
    return text.startsWith('C');
  }

  shouldShowLogoU(text: string): boolean {
    return text.startsWith('U');
  }

  assignLogoType(notification: CombinedNotification): void {
    if (notification.text?.startsWith('C')) {
      notification.logoType = 'C';
    } else if (notification.text?.startsWith('U')) {
      notification.logoType = 'U';
    }
  }


}
