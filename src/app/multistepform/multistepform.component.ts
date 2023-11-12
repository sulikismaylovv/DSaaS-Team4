import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StepperComponent } from '../stepper/stepper.component';

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
export class MultistepformComponent implements OnInit{
  currentStep = 1;
  lastPage = false;
  form!: FormGroup;
  arcadePlan = 9;
  advancedPlan = 12;
  proPlan = 15;
  onlineService = 1;
  storage = 2;
  customProfile = 2;
  total = 9;

  teams = [
    { name: 'OH Leuven' , logoPath: 'assets/logos/oud-heverlee-leuven-seeklogo.com-3.svg',favorite: false },
    { name: 'KVC Westerlo' ,logoPath: 'assets/logos/kvc-westerlo.svg' ,favorite: false },
    { name: 'KV Mechelen', logoPath: 'assets/logos/KV_Mechelen_logo.svg' ,favorite: false},
    { name: 'Anderlecht',logoPath: 'assets/logos/RSC_Anderlecht_logo.svg'  ,favorite: false},
    { name: 'Club Brugge KV', logoPath: 'assets/logos/Club_Brugge_KV_logo.svg' ,favorite: false},
    { name: 'Gent' ,logoPath: 'assets/logos/KAA_Gent_logo.svg' ,favorite: false},
    { name: 'Standard Liege',logoPath: 'assets/logos/Royal_Standard_de_Liege.svg',favorite: false  },
    { name: 'Kortrijk', logoPath: 'assets/logos/KV_Kortrijk_logo.svg' ,favorite: false},
    { name: 'St. Truiden', logoPath: 'assets/logos/VV_St._Truiden_Logo.svg',favorite: false },
    { name: 'Charleroi' ,logoPath: 'assets/logos/Royal_Charleroi_Sporting_Club_logo.svg',favorite: false },
    { name: 'AS Eupen',logoPath: 'assets/logos/Kas_Eupen_Logo.svg' ,favorite: false },
    { name: 'Antwerp' ,logoPath: 'assets/logos/Royal_Antwerp_Football_Club_logo.svg',favorite: false },
    { name: 'Cercle Brugge', logoPath: 'assets/logos/Logo_Cercle_Bruges_KSV_-_2022.svg' ,favorite: false},
    { name: 'Genk' ,logoPath: 'assets/logos/KRC_Genk_Logo_2016.svg',favorite: false },
    { name: 'Union St. Gilloise', logoPath: 'assets/logos/union-saint-gilloise.svg' ,favorite: false},
    { name: 'RWDM', logoPath: 'assets/logos/Logo_RWDMolenbeek.svg',favorite: false },
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

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$"),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),


    });
  }


  onSubmit() {
    this.lastPage = true;
    this.form.reset();
  }

  changePage(isNextPage: boolean) {
    const addOns =
      (this.form.get('onlineService')?.value && this.onlineService) +
      (this.form.get('storage')?.value && this.storage) +
      (this.form.get('customProfile')?.value && this.customProfile);

    if (!isNextPage) {
      return this.currentStep--;
    } else {
      if (this.currentStep === 3) {
        if (this.form.get('plan')?.value === 'arcadePlan') {
          this.total = this.arcadePlan + addOns;
        } else if (this.form.get('plan')?.value === 'advanced') {
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
    console.log(this.form.value);
    console.log('Favorite Team:', this.favoriteTeam);
    console.log('Followed Teams:', Array.from(this.selectedFollowedTeams));
    // Perform submission logic here
  }
}
