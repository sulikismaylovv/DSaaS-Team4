import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class FirstSignGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

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

      console.log("Check user profile");

      if (!user) {
        console.error('No user found');
        await this.router.navigate(['/login']);
        return false;
      }

      if(!(await this.authService.getUserUpdatedAt())){
        await this.router.navigate(['/complete-profile']);
        return false;
      }

      if (this.isWithinOneMinute((await this.authService.getUserUpdatedAt()).toString() , user.created_at)) {
        await this.router.navigate(['/complete-profile']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  }

  private isWithinOneMinute(lastSignIn: string, createdAt: string): boolean {
      console.log(lastSignIn);
      console.log(createdAt);
    if (!lastSignIn) return true;
    const lastSignInDate = new Date(lastSignIn);
    const createdDate = new Date(createdAt);

    // Calculate the difference in milliseconds

    const difference = Math.abs(lastSignInDate.getTime() - createdDate.getTime());

    // Check if the difference is less than or equal to 60,000 milliseconds (1 minute)
    return difference <= 10000;
  }



}
