import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NavbarService {
  // Observable navItem source
  private showNavbarSubject = new BehaviorSubject<boolean>(true);
  // Observable to be used with the async pipe
  public showNavbar$ = this.showNavbarSubject.asObservable();

  private notificationCountSource = new BehaviorSubject<number>(0);
  currentNotificationCount = this.notificationCountSource.asObservable();

  constructor() {}

  public setShowNavbar(show: boolean): void {
    this.showNavbarSubject.next(show);
  }

  public changeNotificationCount(count: number) {
    this.notificationCountSource.next(count);
  }


}
