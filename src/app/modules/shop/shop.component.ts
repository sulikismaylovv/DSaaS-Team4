import {booleanAttribute, Component} from '@angular/core';
import { OnInit } from '@angular/core';
import {BetsService} from "../../core/services/bets.service";
import {AuthService} from "../../core/services/auth.service";
import {Player} from "../../core/services/player.service";
import {PlayerService} from "../../core/services/player.service";
import {PreferencesService} from "../../core/services/preference.service";
import {SupabaseService} from 'src/app/core/services/supabase.service';

export interface PlayerWithClubDetails extends Player {
  clubname: string; // Assuming 'name' is the property you want from the club details
}
export interface userPlayerPurchase{
  id?: number;
  user_id: string;
  player_id: number;
}

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
  showSurpriseModal: boolean = false;

  currentUserID: string | undefined
  players: PlayerWithClubDetails[] = []; // Define Player model according to your data structure
  favoriteClub: Club | undefined;
  followedClubs: Club[] = [];
  playersByClub: { [key: number]: Player[] } = {};
  randomPlayerFavoriteClub: PlayerWithClubDetails | undefined;
  randomPlayer1: PlayerWithClubDetails | undefined;
  randomPlayer2: PlayerWithClubDetails | undefined;
  surprisePlayer: PlayerWithClubDetails | undefined;


  showMoreBadges = false;

  constructor(
    private supabase: SupabaseService,
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
      await this.fetchAndDisplayRandomPlayers();
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
      const allPlayersWithDetails = await this.playerService.fetchPlayersByClubId(this.favoriteClub.id);

      // Fetch the list of player IDs that the user has already purchased
      const purchasedPlayerIds = await this.getPurchasedPlayerIds(this.currentUserID);

      // Filter out the purchased players
      this.players = allPlayersWithDetails.filter(player => !purchasedPlayerIds.includes(player.id));

      console.log("Available players for favorite club:", this.players);
    } else {
      console.log("No favorite club or club ID is undefined.");
    }
  }

  async loadFollowedClubs() {
    if (this.currentUserID) {
      const preferences = await this.preferencesService.getPreferences(this.currentUserID);
      console.log("User preferences:", preferences);

      const followedClubPreferences = preferences.filter(pref => pref.followed_club);
      console.log("Followed club preferences:", followedClubPreferences);

      this.followedClubs = [];
      for (const pref of followedClubPreferences) {
        if (pref.club_id) {
          const club = await this.preferencesService.getClubByClubId(parseInt(pref.club_id));
          this.followedClubs.push(club);
        }
      }
      console.log("Followed clubs:", this.followedClubs);
    } else {
      console.log("Current user ID is undefined.");
    }
  }

  async getPurchasedPlayerIds(userId: string | undefined): Promise<number[]> {
    const { data, error } = await this.supabase.supabaseClient
      .from('user_player_purchases')
      .select('player_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching purchased players:', error);
      throw error;
    }

    // Map through the data to extract just the player_ids
    return data.map((purchase) => purchase.player_id);
  }

  async fetchAndDisplayRandomPlayers() {
    if (this.currentUserID) {
      try {
        //for fav club
        if (this.players.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.players.length);
          this.randomPlayerFavoriteClub = this.players[randomIndex] as PlayerWithClubDetails;
        }

        console.log('Favorite Team Random Player:', this.randomPlayerFavoriteClub);

        // Fetch the first random player while excluding purchased players
        this.randomPlayer1 = await this.fetchRandomPlayer(this.currentUserID);
        console.log('Random Player 1:', this.randomPlayer1);

        // Ensure the second random player is different from the first
        let excludePlayerIds = this.randomPlayer1 ? [this.randomPlayer1.id] : [];

        // Fetch the list of player IDs that the user has already purchased
        const purchasedPlayerIds = await this.getPurchasedPlayerIds(this.currentUserID);
        excludePlayerIds = [...excludePlayerIds, ...purchasedPlayerIds];

        this.randomPlayer2 = await this.fetchRandomPlayer(this.currentUserID, excludePlayerIds, this.favoriteClub?.id);
        console.log('Random Player 2:', this.randomPlayer2);

        // Fetch the surprise player, also excluding purchased and favorite team players
        this.surprisePlayer = await this.fetchRandomPlayer(this.currentUserID, excludePlayerIds, this.favoriteClub?.id);
        console.log('Surprise Player:', this.surprisePlayer);
      } catch (error) {
        console.error('Failed to fetch random players:', error);
      }
    }
  }

  async fetchRandomPlayer(userId: string, excludePlayerIds: number[] = [], favoriteTeamId?: number): Promise<PlayerWithClubDetails | undefined> {
    try {
      const { data: playerData, error: playerError } = await this.supabase.supabaseClient
        .rpc('get_random_player', {
          excluded_players: excludePlayerIds,
          fav_team_id: favoriteTeamId || null
        });

      if (playerError) throw playerError;

      // If the RPC already includes the club name, use it directly
      // Otherwise, fetch the club name separately
      if (playerData?.[0]) {
        let clubName = playerData[0].clubname; // Assuming the RPC returns clubname

        // If clubname isn't part of the RPC response, fetch it separately
        if (!clubName) {
          const { data: clubData, error: clubError } = await this.supabase.supabaseClient
            .from('clubs')
            .select('name')
            .eq('id', playerData[0].club);

          if (clubError) throw clubError;
          clubName = clubData?.[0]?.name;
        }

        // Return the player data with the club name
        return {
          ...playerData[0],
          clubname: clubName
        } as PlayerWithClubDetails;
      }

      return undefined;
    } catch (error) {
      console.error('Error fetching random player:', error);
      throw error;
    }
  }


  async loadPlayersForFollowedClubs() {
    if (this.currentUserID) {
      const preferences = await this.preferencesService.getPreferences(this.currentUserID);
      console.log("Followed Clubs Preferences:", preferences);

      const followedClubs = preferences.filter(pref => pref.followed_club);
      console.log("Filtered Followed Clubs:", followedClubs);

      if (followedClubs.length === 0) {
        console.log("No followed clubs found for this user.");
      }

      for (const pref of followedClubs) {
        console.log("Processing club with ID:", pref.club_id);
        if (pref.club_id) {
          const clubId = parseInt(pref.club_id);
          console.log("Fetching players for club ID:", clubId);
          const players = await this.playerService.fetchPlayersByClubId(clubId);
          console.log(`Players for club ${clubId}:`, players);

          if (!players || players.length === 0) {
            console.log(`No players found for club ID: ${clubId}`);
          } else {
            this.playersByClub[clubId] = players;
          }
        }
      }

      console.log("Final Players by Club:", this.playersByClub);
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

  getClubIds(): number[] {
    return Object.keys(this.playersByClub).map(Number);
  }

  // async makePurchase(userId: string | undefined, playerId: number): Promise<boolean> {
  //   try {
  //     if (!userId) {
  //       console.error('User ID is undefined');
  //       return false;
  //     }
  //
  //     // First, check if the user has enough credits
  //     if (this.userCredits < 100) {
  //       console.error('Not enough credits');
  //       return false;
  //     }
  //
  //     const creditsUpdated = await this.betsService.updateCredits(userId, 100);
  //
  //     if (!creditsUpdated) {
  //       console.error('Failed to update user credits');
  //       return false;
  //     }
  //     // Make the purchase transaction
  //     const { error } = await this.supabase.supabaseClient
  //       .from('user_player_purchases')
  //       .upsert([{ user_id: userId, player_id: playerId}]);
  //
  //     if (error) throw error;
  //
  //     return true;
  //   } catch (error) {
  //     console.error('Error making purchase:', error);
  //     return false;
  //   }
  // }

  async makePurchase(userId: string | undefined, playerId: number, isSurprise: boolean = false): Promise<boolean> {
    try {
      if (!userId) {
        console.error('User ID is undefined');
        return false;
      }

      // First, check if the user has enough credits
      if (this.userCredits < 100) { // You might want to handle the surprise price differently
        console.error('Not enough credits');
        return false;
      }

      let creditsUpdated: boolean = false;

      if (isSurprise) {

        creditsUpdated = await this.betsService.updateCredits(userId, 50); // Adjust the credit deduction for surprise player if needed
      }
      else {
        creditsUpdated = await this.betsService.updateCredits(userId, 100); // Adjust the credit deduction for surprise player if needed

      }

      if (!creditsUpdated) {
        console.error('Failed to update user credits');
        return false;
      }

      // Make the purchase transaction
      const { error } = await this.supabase.supabaseClient
        .from('user_player_purchases')
        .upsert([{ user_id: userId, player_id: playerId }]);

      if (error) throw error;

      // If it's a surprise player, handle the reveal
      if (isSurprise) {
        this.showSurpriseModal = true;
        console.log(" this.showSurpriseModal");
      }

      return true;
    } catch (error) {
      console.error('Error making purchase:', error);
      return false;
    }
  }

  closeSurpriseModal() {
    this.showSurpriseModal = false;
  }
}
