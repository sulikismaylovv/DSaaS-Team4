import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BetsService} from "../../core/services/bets.service";
import {AuthService} from "../../core/services/auth.service";
import {Player, PlayerService} from "../../core/services/player.service";
import {PreferencesService} from "../../core/services/preference.service";
import {SupabaseService} from 'src/app/core/services/supabase.service';
import seedrandom from 'seedrandom';


export interface PlayerWithClubDetails extends Player {
  clubname: string;
  owned?: boolean;
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
  userCredits = 0;
  showSurpriseModal = false;
  showPlayerModal = false;


  currentUserID: string | undefined
  players: PlayerWithClubDetails[] = []; // Define Player model according to your data structure
  favoriteClub: Club | undefined;
  followedClubs: Club[] = [];
  playersByClub: { [key: number]: Player[] } = {};
  randomPlayerFavoriteClub: PlayerWithClubDetails | undefined;
  randomPlayer1: PlayerWithClubDetails | undefined;
  randomPlayer2: PlayerWithClubDetails | undefined;
  surprisePlayer: PlayerWithClubDetails | undefined;
  viewedPlayer: PlayerWithClubDetails | undefined;
  ownedPlayers = new Set<number>();



  showMoreBadges = false;

  constructor(
    private supabase: SupabaseService,
    private betsService: BetsService,
    private authService: AuthService,
    private playerService: PlayerService,
    private preferencesService: PreferencesService,
    private changeDetectorRef: ChangeDetectorRef,

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
      await this.fetchPlayerFavoriteClub(this.currentUserID, [], this.favoriteClub?.id);
      await this.fetchThreeRandomPlayers(this.favoriteClub?.id);
      await this.updateOwnedPlayers();

    }

  }

  async updateOwnedPlayers() {
    const ownedPlayerIds = await this.getPurchasedPlayerIds(this.currentUserID);
    this.ownedPlayers = new Set(ownedPlayerIds);
    this.updatePlayerOwnership();
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

  generateDailySeed() {
    const today = new Date();
    const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) / 1000000;
    return seed.toString();
  }
  shuffleArray(array: any[]) {
    const rng = seedrandom(this.generateDailySeed());
    return array.sort(() => 0.5 - rng());
  }


  async getPurchasedPlayerIds(userId: string | undefined): Promise<number[]> {
    const {data, error} = await this.supabase.supabaseClient
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

  updatePlayerOwnership() {
    if (this.randomPlayerFavoriteClub) {
      this.randomPlayerFavoriteClub.owned = this.ownedPlayers.has(this.randomPlayerFavoriteClub.id);
    }
    [this.randomPlayer1, this.randomPlayer2, this.surprisePlayer].forEach(player => {
      if (player) {
        player.owned = this.ownedPlayers.has(player.id);
      }
    });

    this.loadUserCredits().then(r => {});
    // If you're using OnPush change detection strategy, manually trigger change detection
    this.changeDetectorRef.detectChanges();
  }


  async fetchPlayerFavoriteClub(userId: string, _excludePlayerIds: number[] = [], favoriteTeamId?: number): Promise<PlayerWithClubDetails[]> {
    try {
      const ownedPlayerIds = await this.getPurchasedPlayerIds(userId);
      console.log("Owned player IDs:", ownedPlayerIds);

      const {data: allRandomPlayersData, error: allRandomPlayersError} = await this.supabase.supabaseClient
        .from('randomplayers')
        .select(`
          *,
          players (
           *
          )
        `);

      console.log("All random players:", allRandomPlayersData);
      if (allRandomPlayersError) throw allRandomPlayersError;

      const favoriteClubEntry = allRandomPlayersData.find(rp => rp.club_id === favoriteTeamId);
      if (favoriteClubEntry && favoriteClubEntry.players) {
        this.randomPlayerFavoriteClub = {
          ...favoriteClubEntry.players,
          clubname: this.favoriteClub?.name,  // Assuming this.favoriteClub is populated
          owned: ownedPlayerIds.includes(favoriteClubEntry.players.id)  // Check if the player is owned
        };
        console.log("Random player for favorite club:", this.randomPlayerFavoriteClub);
      } else {
        console.log("No player found for the favorite club.");
      }
      return this.players;
    } catch (error) {
      console.error('Error fetching random players:', error);
      throw error;
    }

  }

  async fetchThreeRandomPlayers(favoriteTeamId?: number): Promise<void> {
    try {
      const ownedPlayerIds = await this.getPurchasedPlayerIds(this.currentUserID);

      // Fetch all players except for the favorite team's player
      const { data: allRandomPlayersData, error } = await this.supabase.supabaseClient
        .from('randomplayers')
        .select(`
        *,
        players (
          *,
          clubs (
            name
          )
        )
      `)
        .not('club_id', 'eq', favoriteTeamId);

      if (error) throw error;

      // Shuffle the players using the daily seed
      const shuffledPlayers = this.shuffleArray(allRandomPlayersData);

      // Filter out players from the same club and select three random players
      const selectedPlayers: PlayerWithClubDetails[] = [];
      const selectedClubs: Set<number> = new Set();

      for (const player of shuffledPlayers) {
        const clubId = player.club_id;
        if (!selectedClubs.has(clubId)) {
          selectedClubs.add(clubId);
          selectedPlayers.push({
            ...player.players,
            clubname: player.players.clubs?.name,
            owned: ownedPlayerIds.includes(player.players.id)
          });

          if (selectedPlayers.length === 3) {
            break;
          }
        }
      }

      // Assign the selected players to the component's properties
      this.randomPlayer1 = selectedPlayers[0] || undefined;
      this.randomPlayer2 = selectedPlayers[1] || undefined;
      this.surprisePlayer = selectedPlayers[2] || undefined;

      console.log("Random player 1:", this.randomPlayer1);
      console.log("Random player 2:", this.randomPlayer2);
      console.log("Surprise player:", this.surprisePlayer);

      // No need to return since we're updating component properties directly
    } catch (error) {
      console.error('Error fetching three random players:', error);
      throw error;
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

  async makePurchase(userId: string | undefined, player: PlayerWithClubDetails, isSurprise = false): Promise<boolean> {
    try {
      if (!userId) {
        console.error('User ID is undefined');
        return false;
      }

      const cost = isSurprise ? 50 : 100; // Cost depends on whether it's a surprise
      if (this.userCredits < cost) {
        console.error('Not enough credits');
        return false;
      }

      // Update the user credits
      const creditsUpdated = await this.betsService.updateCredits(userId, cost);
      if (!creditsUpdated) {
        console.error('Failed to update user credits');
        return false;
      }

      // Make the purchase transaction
      const { error } = await this.supabase.supabaseClient
        .from('user_player_purchases')
        .upsert([{ user_id: userId, player_id: player.id }]);

      if (error) throw error;

      if (isSurprise) {
        this.showSurpriseModal = true; // Reveal the surprise player in a modal
      } else {
        this.openPlayerModal(player); // Show the player details in a modal
      }
      await this.updateOwnedPlayers();


      return true;
    } catch (error) {
      console.error('Error making purchase:', error);
      return false;
    }
  }


  openPlayerModal(player: PlayerWithClubDetails) {
    this.viewedPlayer = player;
    this.showPlayerModal = true;
  }
  closePlayerModal() {
    this.showPlayerModal = false;
  }

  closeSurpriseModal() {
    this.showSurpriseModal = false;
  }
}
