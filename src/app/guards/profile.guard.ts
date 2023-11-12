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
    console.log('Guard checking authentication status');
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated');
      return true;
    } else {
      console.log('User is not authenticated, redirecting to login');
      return this.router.createUrlTree(['/login'], {
        queryParams: { redirect_url: state.url }
      });
    }
  }

}
