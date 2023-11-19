import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService, Profile} from '../../../core/services/auth.service';
import {Router} from '@angular/router';
import {AvatarComponent} from "../avatar/avatar.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  profile: Profile | undefined;
  updateProfileForm!: FormGroup;
  avatarSafeUrl: SafeResourceUrl | undefined;

  @ViewChild(AvatarComponent) avatarComponent!: AvatarComponent;


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit(): Promise<void> {
    this.updateProfileForm = this.formBuilder.group({
      username: [''],
      birthdate: [null],
      first_name: [''],
      last_name: [''],
      avatar_url: ['']
    });

    await this.getProfile();

    if (this.profile && this.profile.avatar_url) {
      try {
        const { data } = await this.authService.downLoadImage(this.profile.avatar_url)
        if (data instanceof Blob) {
          this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }
    }
  }



  // Method to be called after the user's profile is fetched
  get avatarUrl() {
    return this.updateProfileForm.value.avatar_url as string
  }

  async updateAvatar(event: string): Promise<void> {
    this.updateProfileForm.patchValue({
      avatar_url: event,
    })
    await this.updateProfile()
  }

  async getProfile() {
    try {
      this.loading = true;
      const user = this.authService.session?.user;
      if (user) {
        const { data: profile, error } = await this.authService.profile(user);
        if (error) {
          throw error;
        }
        if (profile) {
          this.profile = profile;
          this.updateProfileForm.patchValue(profile);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async handleAvatarUpload(newAvatarUrl: string): Promise<void> {
    // Update the avatar URL in the DashboardComponent
    this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newAvatarUrl); // Update the sanitized URL
  }


  async updateProfile(): Promise<void> {
    try {
      this.loading = true;
      const formValues = this.updateProfileForm.value;
      const updatedProfile = {
        username: formValues.username,
        last_name: formValues.last_name,
        first_name: formValues.first_name,
        birthdate: formValues.birthdate,
        avatar_url: formValues.avatar_url
      };
      await this.authService.updateProfile(updatedProfile);
      await this.handleAvatarUpload(updatedProfile.avatar_url);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }
}
