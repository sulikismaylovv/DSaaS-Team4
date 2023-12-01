import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {User} from "@supabase/supabase-js";

@Injectable({
  providedIn: 'root'
})
export class FirstSignGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkUserProfile();
  }

  private async checkUserProfile(): Promise<boolean> {

    try {
      await this.authService.restoreSession();
      const user = this.authService.session?.user;

      if (!user) {
        console.error('No user found');
        await this.router.navigate(['/login']);
        return false;
      }

      const profile = await this.authService.profile(user);
      if (!profile.data || !profile.data.username || !profile.data.birthdate) {
        await this.router.navigate(['/complete-profile']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  }
}
