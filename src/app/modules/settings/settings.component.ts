import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService, Profile} from '../../core/services/auth.service';
import {Router} from '@angular/router';
import {Session} from "@supabase/supabase-js";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AvatarComponent} from "../account_module/avatar/avatar.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{
  showContent: boolean = false;
  profile: Profile | undefined;

  clickedImage: string | null = null;
  @Input() team: any;
  @Input() selected: boolean = false;
  @Input() favorite: boolean = false; // Add this line to represent a favorite team
  @Output() selectTeam = new EventEmitter<any>();
  hover: boolean = false;
  updateSettingsForm!: FormGroup;
  private session: Session | null | undefined;


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
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

  toggleSelection() {
    // If you want to prevent changing the selection of the favorite team,
    // you can add a condition here:
    if (!this.favorite) {
      this.selectTeam.emit(this.team);
    }
  }

  toggleContent(team: string) {
    if (this.clickedImage === team) {
      // If the same team is clicked again, reset everything
      this.showContent = false;
      this.clickedImage = null;
    } else {
      // Otherwise, show content and set the clicked team
      this.showContent = true;
      this.clickedImage = team;


    }
  }



}
