import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService, Profile} from '../../core/services/auth.service';
import {Session,} from "@supabase/supabase-js";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AvatarComponent} from "../account_module/avatar/avatar.component";
import {Club, PreferencesService} from "../../core/services/preference.service";
import {SupabaseService} from "../../core/services/supabase.service";
import {ImageDownloadService} from "../../core/services/imageDownload.service";

interface ClubShow{
  club: Club;
  clubLogo: SafeResourceUrl | undefined;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{
  showContent: boolean = false;
  profile: Profile | undefined;
  clubs: ClubShow[] = [];

  clickedImage: string | null = null;
  @Input() team: any;
  @Input() selected: boolean = false;
  @Input() favorite: boolean = false; // Add this line to represent a favorite team
  @Output() selectTeam = new EventEmitter<any>();
  hover: boolean = false;
  updateSettingsForm!: FormGroup;
  favoriteClub: ClubShow | undefined;
  followedClubs: ClubShow[] = [];
  selectedFavoriteClubId: number | undefined;  // Temporary state for selected favorite club


  constructor(
    private readonly authService: AuthService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private preferencesService: PreferencesService,
    private readonly supabase: SupabaseService,
    private readonly imageDownloadService: ImageDownloadService
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
        async () => {
          this.favoriteClub = await this.fetchFavoriteClubId();
          if (this.favoriteClub !== undefined) {
            this.selectedFavoriteClubId = this.favoriteClub.club.id;
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
    await this.initializeData();
  }

  private async initializeData(): Promise<void> {
    await this.getProfile();
    this.clubs = await this.fetchAllClubs();
    this.favoriteClub = await this.fetchFavoriteClubId();
    if (this.favoriteClub) {
      this.selectedFavoriteClubId = this.favoriteClub.club.id;
    }

    this.followedClubs = await this.fetchFollowedClubs();
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

  private async fetchFavoriteClubId(): Promise<ClubShow | undefined> {
    const userId = this.authService.session?.user?.id;
    if (!userId) throw new Error('User not authenticated');
    const preference = await this.preferencesService.getFavoritePreferences(userId);
    console.log('preference: ', preference);
    if( preference !== undefined && preference.club_id !== undefined){
      const favClub = await this.preferencesService.getClubByClubId(parseInt(preference.club_id));
      //const clubLogo = await this.imageDownloadService.loadClubImage(favClub.logo);
      const clubLogo = undefined;
      return  {club: favClub, clubLogo: clubLogo};
    }
    return undefined;
  }

  private async fetchAllClubs(): Promise<ClubShow[]>{
    let clubs: ClubShow[] = [];
    const Club = await this.preferencesService.fetchAllClubs();
    for (let club of Club){
      const clubLogo = undefined;
      const clubShow: ClubShow = {club: club, clubLogo: clubLogo};
      clubs.push(clubShow);
    }
    return clubs;

  }


  private async fetchFollowedClubs(): Promise<ClubShow[]>{
    let clubs: ClubShow[] = [];
    const userId = this.authService.session?.user?.id;
    if (!userId) throw new Error('User not authenticated');
    const preferences = await this.preferencesService.getFollowedPreferences(userId);
    for (let preference of preferences){
      const club = await this.preferencesService.getClubByClubId(parseInt(preference.club_id));
      const clubLogo = undefined;
      //const clubLogo = await this.imageDownloadService.loadClubImage(club.logo);
      const clubShow: ClubShow = {club: club, clubLogo: clubLogo};
      clubs.push(clubShow);}
    console.log('clubs: ', clubs);
    return clubs;
  }

  isClubFollowed(clubId: number | undefined): boolean {
    if (clubId === undefined) return false;
    return this.followedClubs.some(c => c.club.id === clubId);
  }

  async selectFavoriteClub(clubId: number | undefined): Promise<void>{
    console.log('selected id: ', clubId);
    if (clubId === undefined) {return;}

    const userId = this.authService.session?.user?.id;
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    try {
      if( this.favoriteClub !== undefined){
        if( this.favoriteClub.club.id === undefined) throw new Error('favoriteClub.id is undefined');
        if( this.favoriteClub.club.id !== clubId){
          console.log('this.favoriteClub: ', this.favoriteClub);
          await this.preferencesService.deletePreference({
            club_id: this.favoriteClub?.club.id.toString(),
            favorite_club: true, followed_club: false, user_id: userId
          });
        }
        else{
          return;
        }
      }
      await this.preferencesService.upsertPreference({ user_id: userId, club_id: clubId.toString(), favorite_club: true, followed_club: false });
      this.favoriteClub = await this.fetchFavoriteClubId();
      await this.initializeData();
      //alert('Favorite club updated successfully');
    } catch (error) {
      alert('Error updating favorite club: ' + error);
    }
  }

  // Method to toggle club follow status
  async toggleFollowClub(clubId: number | undefined): Promise<void> {

    if (clubId === undefined) return;
    const userId = this.authService.session?.user?.id;
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    // Fetch current preferences for the user
    const existingPreferences = await this.preferencesService.getPreferences(userId);

    // Check if the club is the favorite club
    console.log('existingPreferences: ', existingPreferences);
    const isFavorite = existingPreferences.some(pref => pref.favorite_club && pref.club_id === clubId.toString());

    if (isFavorite) {
      alert('Cannot unfollow your favorite club.');
      return;
    }


    const isFollowed = this.followedClubs.some(c => c.club.id === clubId);

    if (isFollowed) {
      await this.unfollowClub(clubId);
    } else {
      await this.followClub(clubId);
    }

    this.followedClubs = await this.fetchFollowedClubs(); // Refresh the list
  }

  // Method to follow a club
  private async followClub(clubId: number): Promise<void> {
    const userId = this.authService.session?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      await this.preferencesService.upsertPreference({
        user_id: userId,
        club_id: clubId.toString(),
        favorite_club: false,
        followed_club: true
      });
    } catch (error) {
      console.error('Error following club: ', error);
    }
  }

  // Method to unfollow a club
  private async unfollowClub(clubId: number): Promise<void> {
    const userId = this.authService.session?.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      await this.preferencesService.deletePreference({
        favorite_club: false,
        user_id: userId,
        club_id: clubId.toString(),
        followed_club: true
      });
    } catch (error) {
      console.error('Error unfollowing club: ', error);
    }
  }




}
