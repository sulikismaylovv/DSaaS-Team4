import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation,} from '@angular/core';
import {FormBuilder, FormGroup, Validators,} from '@angular/forms';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {Router} from "@angular/router";
import {PreferencesService} from "../../../core/services/preference.service";
import {NavbarService} from "../../../core/services/navbar.service";

interface Team {
    id: number;
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
    showSummary = true;
    isSubmitting = false;

    teams = [
        {id: 260, name: 'OH Leuven', logoPath: 'assets/logos/oud-heverlee-leuven-seeklogo.com-3.svg', favorite: false},
        {id: 261, name: 'KVC Westerlo', logoPath: 'assets/logos/kvc-westerlo.svg', favorite: false},
        {id: 266, name: 'KV Mechelen', logoPath: 'assets/logos/KV_Mechelen_logo.svg', favorite: false},
        {id: 554, name: 'Anderlecht', logoPath: 'assets/logos/RSC_Anderlecht_logo.svg', favorite: false},
        {id: 569, name: 'Club Brugge KV', logoPath: 'assets/logos/Club_Brugge_KV_logo.svg', favorite: false},
        {id: 631, name: 'Gent', logoPath: 'assets/logos/KAA_Gent_logo.svg', favorite: false},
        {id: 733, name: 'Standard Liege', logoPath: 'assets/logos/Royal_Standard_de_Liege.svg', favorite: false},
        {id: 734, name: 'Kortrijk', logoPath: 'assets/logos/KV_Kortrijk_logo.svg', favorite: false},
        {id: 735, name: 'St. Truiden', logoPath: 'assets/logos/VV_St._Truiden_Logo.svg', favorite: false},
        {id: 736, name: 'Charleroi', logoPath: 'assets/logos/Royal_Charleroi_Sporting_Club_logo.svg', favorite: false},
        {id: 739, name: 'AS Eupen', logoPath: 'assets/logos/Kas_Eupen_Logo.svg', favorite: false},
        {id: 740, name: 'Antwerp', logoPath: 'assets/logos/Royal_Antwerp_Football_Club_logo.svg', favorite: false},
        {id: 741, name: 'Cercle Brugge', logoPath: 'assets/logos/Logo_Cercle_Bruges_KSV_-_2022.svg', favorite: false},
        {id: 742, name: 'Genk', logoPath: 'assets/logos/KRC_Genk_Logo_2016.svg', favorite: false},
        {id: 1393, name: 'Union St. Gilloise', logoPath: 'assets/logos/union-saint-gilloise.svg', favorite: false},
        {id: 6224, name: 'RWDM', logoPath: 'assets/logos/Logo_RWDMolenbeek.svg', favorite: false},
    ];

    selectedFollowedTeams = new Set<Team>();
    favoriteTeam: Team | null = null; // Initialize with null for no selection
    profile: Profile | undefined;
    loading = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private formBuilder: FormBuilder,
        private preferencesService: PreferencesService,
        public navbarService: NavbarService
    ) {
    }

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

    async ngOnInit(): Promise<void> {
        this.navbarService.setShowNavbar(false);
        // Subscribe to the auth state changes
        this.updateProfileForm = this.formBuilder.group({
            username: ['', Validators.required],
            birthdate: [null, Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
        });

        await this.fetch();
    }


    async onSubmit() {
        this.isSubmitting = true;
        try {
            await this.completeProfile();
            await this.updatePreferences();
            this.showSummary = false;
            this.lastPage = true;
            //this.updateProfileForm.reset();
            //await this.router.navigate(['/home']);
        } catch (error) {
            if (error instanceof Error) {
                // Show an error message and allow the user to try again
                alert('An error occurred: ' + error.message + ' Please try again.');
                // Optionally, reset part of your form or state here if needed
            }
            this.isSubmitting = false;
        }
        this.isSubmitting = false;
        this.showSummary = false;
        this.lastPage = true;
    }

    async updatePreferences(): Promise<void> {
        try {
            const user = this.authService.session?.user;
            if (!user || !user.id) throw new Error('User ID is undefined');

            const userId = user.id; // Ensured to be a string

            if (this.favoriteTeam) {
                await this.preferencesService.upsertPreference({
                    user_id: userId,
                    club_id: this.favoriteTeam.id.toString(),
                    favorite_club: true,
                    followed_club: false
                });
            }

            for (const team of this.selectedFollowedTeams) {
                await this.preferencesService.upsertPreference({
                    user_id: userId,
                    club_id: team.id.toString(), // Convert to string
                    favorite_club: false,
                    followed_club: true,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
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

    async fetch() {
        // ... implementation of getProfile ...
        try {
            this.loading = true;
            const user = this.authService.session?.user;
            if (user) {
                const {data: profile, error} = await this.authService.profile(user);
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
        }
    }

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
