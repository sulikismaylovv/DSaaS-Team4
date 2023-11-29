import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService, Profile} from '../../core/services/auth.service';
import {Router} from '@angular/router';
import {Session} from "@supabase/supabase-js";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AvatarComponent} from "../account_module/avatar/avatar.component";
import {Club, PreferencesService} from "../../core/services/preference.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{
  showContent: boolean = false;
  profile: Profile | undefined;
  clubs: Club[] = [];

  clickedImage: string | null = null;
  @Input() team: any;
  @Input() selected: boolean = false;
  @Input() favorite: boolean = false; // Add this line to represent a favorite team
  @Output() selectTeam = new EventEmitter<any>();
  hover: boolean = false;
  updateSettingsForm!: FormGroup;
  private session: Session | null | undefined;
  private favoriteClubId: number | null = null;


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private preferencesService: PreferencesService
  ) {
  }

  avatarSafeUrl: SafeResourceUrl | undefined;

  @ViewChild(AvatarComponent) avatarComponent!: AvatarComponent;


  // Method to be called after the user's profile is fetched
  get avatarUrl() {
    return this.updateSettingsForm.value.avatar_url as string
  }

  async ngOnInit(): Promise<void> {
    this.updateSettingsForm = this.formBuilder.group({
      username: [''],
      birthdate: [null],
      first_name: [''],
      last_name: [''],
      avatar_url: ['']
    });

    await this.getProfile();

    if (this.profile && this.profile.avatar_url) {
      try {
        console.log('this.profile.avatar_url: ', this.profile.avatar_url);
        const {data} = await this.authService.downLoadImage(this.profile.avatar_url)
        if (data instanceof Blob) {
          this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }
    }

    this.clubs = await this.fetchAllClubs();
    this.favoriteClubId = await this.fetchFavoriteClubId();
    console.log('this.clubs: ', this.clubs);
  }

  async updateAvatar(event: string): Promise<void> {
    this.updateSettingsForm.patchValue({
      avatar_url: event,
    })
    await this.updateProfile()
  }

  async getProfile() {
    try {
      const user = this.authService.session?.user;
      if (user) {
        const {data: profile, error} = await this.authService.profile(user);
        if (error) {
          throw error;
        }
        if (profile) {
          this.profile = profile;
          this.updateSettingsForm.patchValue(profile);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
    }
  }

  async handleAvatarUpload(newAvatarUrl: string): Promise<void> {
    try {
      const {data} = await this.authService.downLoadImage(newAvatarUrl);
      if (data instanceof Blob) {
        this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error downloading image: ', error.message)
      }
    }
  }


  async updateProfile(): Promise<void> {
    try {
      const formValues = this.updateSettingsForm.value;
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
    }
  }

  private async fetchFavoriteClubId(): Promise<number | null> {
    const userId = this.authService.session?.user?.id;
    if (!userId) return null;
    const preference = await this.preferencesService.getFavoritePreferences(userId);
    console.log('preference: ', preference);
    return preference ? parseInt(preference.club_id) : null;
  }

  private async fetchAllClubs(): Promise<Club[]>{
      return await this.preferencesService.fetchAllClubs();
  }

  async selectFavoriteClub(clubId: number): Promise<void> {
    const userId = this.authService.session?.user?.id;
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    try {
      await this.preferencesService.deletePreference({
        updated_at: new Date(), followed_club: false,
        favorite_club: true, user_id: userId, club_id: this.favoriteClubId?.toString() || '' });
      await this.preferencesService.upsertPreference({ user_id: userId, club_id: clubId.toString(), favorite_club: true, followed_club: false });
      this.favoriteClubId = clubId;
      alert('Favorite club updated successfully');
    } catch (error) {
      alert('Error updating favorite club');
    }
  }




}
