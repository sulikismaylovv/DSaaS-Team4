import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {BetsService} from "../../core/services/bets.service";
import {AuthService} from "../../core/services/auth.service";
import {Player} from "../../core/services/player.service";
import {PlayerService} from "../../core/services/player.service";
import {PreferencesService} from "../../core/services/preference.service";

export interface Club {
  id?: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
  leagueID: number;
}
@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  userCredits: number = 0;
  currentUserID: string | undefined;
  players: Player[] = []; // Define Player model according to your data structure
  favoriteClub: Club | undefined;

  showMoreBadges = false;

  constructor(
    private betsService: BetsService,
    private authService: AuthService,
    private playerService: PlayerService,
    private preferencesService: PreferencesService
  ) {
  }

  ngOnInit() {
    this.initializeUser();
  }

  async initializeUser() {
    this.currentUserID = this.authService.session?.user?.id;
    console.log("Current user ID:", this.currentUserID);

    if (this.currentUserID) {
      await this.loadUserCredits();
      await this.loadUserFavoriteClub();
      await this.loadPlayersForFavoriteClub();
    }
  }

  async loadUserFavoriteClub() {
    if (this.currentUserID) {
      const preferences = await this.preferencesService.getPreferences(this.currentUserID);
      console.log("User preferences:", preferences);

      const favoriteClubPreference = preferences.find(pref => pref.favorite_club);
      if (favoriteClubPreference && favoriteClubPreference.club_id) {
        this.favoriteClub = await this.preferencesService.getClubByClubId(parseInt(favoriteClubPreference.club_id));
        console.log("Favorite club:", this.favoriteClub);
      } else {
        console.log("No favorite club preference found.");
      }
    }
  }

  async loadPlayersForFavoriteClub() {
    if (this.favoriteClub && this.favoriteClub.id) {
      console.log("Fetching players for club ID:", this.favoriteClub.id);
      this.players = await this.playerService.fetchPlayersByClubId(this.favoriteClub.id);
      console.log("Players for favorite club:", this.players);
    } else {
      console.log("No favorite club or club ID is undefined.");
    }
  }


  async loadUserCredits() {
    if (this.currentUserID) {
      this.userCredits = await this.betsService.getUserCredits(this.currentUserID);
      console.log("User credits:", this.userCredits);
    } else {
      console.log("Current user ID is undefined.");
    }
  }
}
