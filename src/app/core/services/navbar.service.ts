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
  constructor() {}
  public setShowNavbar(show: boolean): void {
    this.showNavbarSubject.next(show);
  }
}
