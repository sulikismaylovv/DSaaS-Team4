import {Component} from '@angular/core';
import {NavbarService} from "../../core/services/navbar.service";
import {ThemeService} from "../../core/services/theme.service";
import {AuthService, Profile} from "../../core/services/auth.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ImageDownloadService} from "../../core/services/imageDownload.service";
import {SupabaseService} from "../../core/services/supabase.service";

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  notificationCount: number = 0;
  private subscription: Subscription | undefined;
  profile: Profile | undefined;
  username: string | undefined;
  avatarSafeUrl: SafeResourceUrl | undefined;


  constructor(
        public navbarService: NavbarService,
        public themeService: ThemeService,
        protected readonly authService: AuthService,
        private readonly imageService: ImageDownloadService,
        private readonly supabase: SupabaseService,
        private router: Router
    ) {
    this.supabase.supabaseClient
      .channel('realtime-friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        async () => {
          await this.navbarService.setNotificationCount(this.profile?.id);
          await this.navbarService.refreshNotificationCount(this.profile?.id);
        }
      )
      .subscribe()

    }

  async ngOnInit() {
    await this.authService.restoreSession();

    if(this.authService.session?.user.id) {
      await this.getProfile();
      if (this.profile?.username) {
        this.avatarSafeUrl = await this.imageService.loadAvatarImage(this.profile?.id)
        await this.navbarService.setNotificationCount(this.profile?.id);
        await this.navbarService.refreshNotificationCount(this.profile?.id);
        await new Promise<void>((resolve) => {
          this.navbarService.currentNotificationCount$.subscribe((count) => {
            this.notificationCount = count;
            //console.log(this.notificationCount);
            resolve();
          });
        });
      }
    }

  }

  async getProfile() {
    try {
      const user = this.authService.session?.user;
      if (user) {
        const {data: profile, error} = await this.authService.profileById(user.id);
        if (error) {
          alert(error.message);
        }
        this.profile = profile;
        this.username = profile.username;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async navigateToLogin() {
    await this.router.navigateByUrl('/login'); // Adjust the path as necessary for your app's route configuration
  }

  async navigatetoRegister() {
      await this.router.navigateByUrl('/register'); // Adjust the path as necessary for your app's route configuration
  }// }

  ngOnDestroy() {
    // Don't forget to unsubscribe to ensure no memory leaks
    if(this.subscription)
    this.subscription.unsubscribe();
  }

}
