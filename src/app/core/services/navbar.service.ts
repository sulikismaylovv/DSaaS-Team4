import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {NotificationsService} from "./notifications.service";
import {SupabaseService} from "./supabase.service";
import {FriendshipService} from "./friendship.service";

@Injectable({
    providedIn: 'root'
})
export class NavbarService {
  // Observable navItem source
  private showNavbarSubject = new BehaviorSubject<boolean>(true);
  // Observable to be used with the async pipe
  public showNavbar$ = this.showNavbarSubject.asObservable();

  public notificationCountSubject = new BehaviorSubject<number>(0);
  currentNotificationCount$: Observable<number> = this.notificationCountSubject.asObservable();

  constructor( private readonly notificationsService: NotificationsService,
               private readonly friendshipService: FriendshipService
               ){

  }

  public setShowNavbar(show: boolean): void {
    this.showNavbarSubject.next(show);
  }

  public changeNotificationCount(count: number) {
    this.notificationCountSubject.next(count);
    this.currentNotificationCount$ = this.notificationCountSubject.asObservable();
  }

  public async refreshNotificationCount(userId: string| undefined): Promise<void> {
    if(!userId) return;
    const notifications = await this.notificationsService.getNotificationsForUser(userId);
    this.notificationCountSubject.next(notifications.length);
  }

  public async setNotificationCount(userId: string | undefined): Promise<void> {
    if (!userId) {
      throw new Error('User ID is undefined');
    }

    // Fetch notifications
    const notifications = await this.notificationsService.getNotificationsForUser(userId);
    const requests = await this.friendshipService.getFriendRequests(userId);


    // Update the notification count
    const totalNotifications = notifications.length + requests.length;

    this.changeNotificationCount(totalNotifications);
  }




}
