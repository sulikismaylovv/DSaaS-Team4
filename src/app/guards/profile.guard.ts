import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from "../core/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // Check if the user is authenticated
    if (this.authService.isAuthenticated()) {
      // Allow access if the user is authenticated
      return true;
    } else {
      // If the user is not authenticated, redirect to the login page
      // and pass the redirect URL so the user can be redirected back after logging in
      return this.router.createUrlTree(['/login'], {
        queryParams: { redirect_url: state.url }
      });
    }
  }
}
