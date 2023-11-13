import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {Router} from "@angular/router";

interface Team {
  name: string;
  logoPath: string;
  favorite?: boolean;
}
@Component({
  selector: 'app-multistepform',
  templateUrl: './multistepform.component.html',
  styleUrls: ['./multistepform.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultistepformComponent implements OnInit {
  currentStep = 1;
  lastPage = false;
  updateProfileForm!: FormGroup;
  arcadePlan = 9;
  advancedPlan = 12;
  proPlan = 15;
  onlineService = 1;
  storage = 2;
  customProfile = 2;
  total = 9;

  teams = [
    {name: 'OH Leuven', logoPath: 'assets/logos/oud-heverlee-leuven-seeklogo.com-3.svg', favorite: false},
    {name: 'KVC Westerlo', logoPath: 'assets/logos/kvc-westerlo.svg', favorite: false},
    {name: 'KV Mechelen', logoPath: 'assets/logos/KV_Mechelen_logo.svg', favorite: false},
    {name: 'Anderlecht', logoPath: 'assets/logos/RSC_Anderlecht_logo.svg', favorite: false},
    {name: 'Club Brugge KV', logoPath: 'assets/logos/Club_Brugge_KV_logo.svg', favorite: false},
    {name: 'Gent', logoPath: 'assets/logos/KAA_Gent_logo.svg', favorite: false},
    {name: 'Standard Liege', logoPath: 'assets/logos/Royal_Standard_de_Liege.svg', favorite: false},
    {name: 'Kortrijk', logoPath: 'assets/logos/KV_Kortrijk_logo.svg', favorite: false},
    {name: 'St. Truiden', logoPath: 'assets/logos/VV_St._Truiden_Logo.svg', favorite: false},
    {name: 'Charleroi', logoPath: 'assets/logos/Royal_Charleroi_Sporting_Club_logo.svg', favorite: false},
    {name: 'AS Eupen', logoPath: 'assets/logos/Kas_Eupen_Logo.svg', favorite: false},
    {name: 'Antwerp', logoPath: 'assets/logos/Royal_Antwerp_Football_Club_logo.svg', favorite: false},
    {name: 'Cercle Brugge', logoPath: 'assets/logos/Logo_Cercle_Bruges_KSV_-_2022.svg', favorite: false},
    {name: 'Genk', logoPath: 'assets/logos/KRC_Genk_Logo_2016.svg', favorite: false},
    {name: 'Union St. Gilloise', logoPath: 'assets/logos/union-saint-gilloise.svg', favorite: false},
    {name: 'RWDM', logoPath: 'assets/logos/Logo_RWDMolenbeek.svg', favorite: false},
  ];

  selectedFollowedTeams = new Set<Team>();
  favoriteTeam: Team | null = null; // Initialize with null for no selection


  selectFavorite(team: Team): void {
    if (this.favoriteTeam) {
      const index = this.teams.findIndex(t => t === this.favoriteTeam);
      if (index !== -1) {
        this.teams[index].favorite = false; // Update the original array to reflect changes
      }
    }
    this.favoriteTeam = team;
    team.favorite = true;
    // Trigger change detection by creating a new array instance
    this.teams = [...this.teams];
  }

  toggleTeamFollow(team: Team): void {
    if (team !== this.favoriteTeam) {
      if (this.selectedFollowedTeams.has(team)) {
        this.selectedFollowedTeams.delete(team);
      } else {
        this.selectedFollowedTeams.add(team);
      }
      // Update the set to trigger change detection
      this.selectedFollowedTeams = new Set([...this.selectedFollowedTeams]);
    }
  }

  profile: Profile | undefined;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.updateProfileForm = this.formBuilder.group({
      username: ['', Validators.required],
      birthdate: [null, Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
    });

    await this.fetch();
  }


  async onSubmit() {
    await this.completeProfile();
    this.lastPage = true;
    this.updateProfileForm.reset();

    await this.router.navigate(['/home']);
  }

  changePage(isNextPage: boolean) {
    const addOns =
      (this.updateProfileForm.get('onlineService')?.value && this.onlineService) +
      (this.updateProfileForm.get('storage')?.value && this.storage) +
      (this.updateProfileForm.get('customProfile')?.value && this.customProfile);

    if (!isNextPage) {
      return this.currentStep--;
    } else {
      if (this.currentStep === 3) {
        if (this.updateProfileForm.get('plan')?.value === 'arcadePlan') {
          this.total = this.arcadePlan + addOns;
        } else if (this.updateProfileForm.get('plan')?.value === 'advanced') {
          this.total = this.advancedPlan + addOns;
        } else {
          this.total = this.proPlan + addOns;
        }
      }
      return this.currentStep++;
    }
  }

  submitForm(): void {
    console.log('Form submitted');
    console.log(this.updateProfileForm.value);
    console.log('Favorite Team:', this.favoriteTeam);
    console.log('Followed Teams:', Array.from(this.selectedFollowedTeams));
    // Perform submission logic here
  }

  async fetch() {
    // ... implementation of getProfile ...
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
          console.log("Profile: " + profile);
          this.updateProfileForm.patchValue(profile);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }  }

  async completeProfile(): Promise<void> {
    // ... implementation of updateProfile ...
    try {
      this.loading = true;
      const formValues = this.updateProfileForm.value;
      const updatedProfile = {
        username: formValues.username,
        last_name: formValues.last_name,
        first_name: formValues.first_name,
        birthdate: formValues.birthdate
      };
      console.log(updatedProfile);
      await this.authService.updateProfile(updatedProfile);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }
}
