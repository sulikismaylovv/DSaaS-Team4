import { Component } from '@angular/core';


export interface Team {
  name: string;
  logoPath: string;
  favorite?: boolean;
}
@Component({
  selector: 'app-registerationclubs',
  templateUrl: './registerationclubs.component.html',
  styleUrls: ['./registerationclubs.component.css']
})
export class RegisterationclubsComponent{

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
  selectedTeams = new Set();
  favoriteTeam: any = null; // This will hold the selected favorite team

  selectingFavorites: boolean = true; // Whether the user is selecting their favorite team

  selectFavorite(team: any) {
    this.favoriteTeam = team;
    // Transition to selecting teams to follow
    this.selectingFavorites = false;
  }

  onTeamSelect(team: any) {
    // Check if the team clicked is already the favorite team
    if (this.favoriteTeam === team) {
      // If so, unset it and allow the user to select a favorite team again
      this.favoriteTeam.favorite = false; // Unset favorite flag for the team
      this.favoriteTeam = null; // Clear the current favorite team
    } else {
      // If it's not the currently selected favorite team, set it as the new favorite
      if (this.favoriteTeam) {
        this.favoriteTeam.favorite = false; // Ensure the previous favorite is no longer marked as such
      }
      this.favoriteTeam = team; // Set the new favorite team
      team.favorite = true; // Set favorite flag for the team
    }

    // No need to toggle selectingFavorites since you're still in the favorite selection process
    // Trigger change detection by updating the array if necessary
    this.teams = [...this.teams];
  }


// This method is used for selecting or deselecting teams to follow
  toggleTeamFollow(team: any) {
    if (this.favoriteTeam !== team) { // Prevent the favorite team from being toggled
      if (this.selectedTeams.has(team)) {
        this.selectedTeams.delete(team);
      } else {
        this.selectedTeams.add(team);
      }
      // Trigger change detection if necessary
      this.selectedTeams = new Set([...this.selectedTeams]);
    }
  }



}
