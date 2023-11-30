import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService, Profile} from '../../core/services/auth.service';
import {Router} from '@angular/router';
import {Session, SupabaseClient} from "@supabase/supabase-js";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AvatarComponent} from "../account_module/avatar/avatar.component";
import {Club, Preference, PreferencesService} from "../../core/services/preference.service";
import {SupabaseService} from "../../core/services/supabase.service";

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
  favoriteClub: Club | undefined;
  selectedFavoriteClubId: number | undefined;  // Temporary state for selected favorite club
  logoPath: string | undefined;


  teams = [
    {id: 260, logoPath: 'assets/logos/oud-heverlee-leuven-seeklogo.com-3.svg'},
    {id: 261, logoPath: 'assets/logos/kvc-westerlo.svg' },
    {id: 266, logoPath: 'assets/logos/KV_Mechelen_logo.svg'},
    {id: 554,  logoPath: 'assets/logos/RSC_Anderlecht_logo.svg'},
    {id: 569, logoPath: 'assets/logos/Club_Brugge_KV_logo.svg'},
    {id: 631, logoPath: 'assets/logos/KAA_Gent_logo.svg'},
    {id: 733, logoPath: 'assets/logos/Royal_Standard_de_Liege.svg'},
    {id: 734,  logoPath: 'assets/logos/KV_Kortrijk_logo.svg'},
    {id: 735, logoPath: 'assets/logos/VV_St._Truiden_Logo.svg'},
    {id: 736,  logoPath: 'assets/logos/Royal_Charleroi_Sporting_Club_logo.svg'},
    {id: 739, logoPath: 'assets/logos/Kas_Eupen_Logo.svg'},
    {id: 740,  logoPath: 'assets/logos/Royal_Antwerp_Football_Club_logo.svg'},
    {id: 741,  logoPath: 'assets/logos/Logo_Cercle_Bruges_KSV_-_2022.svg'},
    {id: 742, logoPath: 'assets/logos/KRC_Genk_Logo_2016.svg'},
    {id: 1393, logoPath: 'assets/logos/union-saint-gilloise.svg'},
    {id: 6224, logoPath: 'assets/logos/Logo_RWDMolenbeek.svg'},
  ];


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private preferencesService: PreferencesService,
    private readonly supabase: SupabaseService,
  ) {
    this.supabase.supabaseClient
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'preferences',
        },
        async (payload) => {
          this.favoriteClub = await this.fetchFavoriteClubId();
          this.logoPath = this.teams.find(team => team.id === this.favoriteClub?.id)?.logoPath;
          if (this.favoriteClub !== undefined) {
            this.selectedFavoriteClubId = this.favoriteClub.id;
          }
        }
      )
      .subscribe();

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
    this.favoriteClub = await this.fetchFavoriteClubId();
    if( this.favoriteClub !== undefined){ this.selectedFavoriteClubId = this.favoriteClub.id; }

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
      if(this.selectedFavoriteClubId !== undefined){
        await this.selectFavoriteClub(this.selectedFavoriteClubId);
      }
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

  private async fetchFavoriteClubId(): Promise<Club | undefined> {
    const userId = this.authService.session?.user?.id;
    if (!userId) throw new Error('User not authenticated');
    const preference = await this.preferencesService.getFavoritePreferences(userId);
    console.log('preference: ', preference);
    if( preference !== undefined && preference.club_id !== undefined){
    const favClub = await this.preferencesService.getClubByClubId(parseInt(preference.club_id));
    console.log('favClub: ', favClub);
    return favClub;}
    return undefined;
  }

  private async fetchAllClubs(): Promise<Club[]>{
      return await this.preferencesService.fetchAllClubs();
  }

  selectFavoriteClubLocally(clubId: number | undefined): void {
    if(clubId === undefined) return;
    this.selectedFavoriteClubId = clubId;
  }


  async selectFavoriteClub(clubId: number | undefined): Promise<void>{
    if (clubId === undefined) {return;}

    const userId = this.authService.session?.user?.id;
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    try {
      if( this.favoriteClub !== undefined){
        if( this.favoriteClub.id === undefined) throw new Error('favoriteClub.id is undefined');
        console.log('this.favoriteClub: ', this.favoriteClub);
        await this.preferencesService.deletePreference({
          club_id: this.favoriteClub?.id.toString(),
          favorite_club: true, followed_club: false, user_id: userId
        });
      }
      await this.preferencesService.upsertPreference({ user_id: userId, club_id: clubId.toString(), favorite_club: true, followed_club: false });
      this.favoriteClub = await this.fetchFavoriteClubId();
      //alert('Favorite club updated successfully');
    } catch (error) {
      alert('Error updating favorite club: ' + error);
    }
  }




}
