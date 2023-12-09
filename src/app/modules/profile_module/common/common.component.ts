import {Component, Input, OnInit} from '@angular/core';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {PostsService} from "../../../core/services/posts.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Club, Preference, PreferencesService} from "../../../core/services/preference.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {Post} from "../../../core/models/posts.model";
import {SupabaseService} from "../../../core/services/supabase.service";
import {MatDialog} from "@angular/material/dialog";
import {FriendshipService} from "../../../core/services/friendship.service";
import {Player} from "../../../core/services/player.service";
import {
  FriendsLeagueInterface,
  FriendsLeague} from "../../../core/services/friends-league.service";
import {UserServiceService} from "../../../core/services/user-service.service";


export enum FriendRequestStatus {
  None = 'none',
  Requested = 'requested',
  Friends = 'friends'
}

interface UserLeague {
  leagueId: number | undefined;
  leagueName: string;
  userPosition: number | string;
  topMembers: UserInFriendsLeague[];
  currentUserPosition: number | undefined;
  isCurrentUserInTop: boolean;
  currentUserInLeague: UserInFriendsLeague | null;

}
type LeagueMembers = { [key: number]: UserInFriendsLeague[] };


interface FriendInfo {
  profile: Profile;
  avatarSafeUrl: SafeResourceUrl;
  commonFriend?: boolean;
}
export interface PlayerWithClubDetails extends Player {
  clubname: string;
  owned?: boolean;
}

export interface UserInFriendsLeague {
  id?: number;
  userid: string;
  leagueid: number;
  xp: number;
  username?: string; // Include username
  position?: number; // Include position
}



@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.css']
})
export class CommonComponent implements OnInit{
  @Input() userRefId: string | null | undefined;
  isOwnProfile = false;
  loading = true;
  profile: Profile | undefined;
  username: string | undefined;
  avatarSafeUrl: SafeResourceUrl | undefined;
  bgImageSafeUrl: SafeResourceUrl | undefined;
  bgSafeUrl: string | ArrayBuffer | null = 'assets/images/default-background.jpg';
  posts: Post[] = [];
  preference: Preference[] = [];
  favClub: Club | undefined;
  followingClub: Club[] = [];
  favoriteClub: string | undefined;
  followedClubs: string[] | undefined;
  friendRequestStatus: FriendRequestStatus = FriendRequestStatus.None;
  friendsList: FriendInfo[] = []; // Array to store friends' info

  infoString: string[]= ['Friends', 'Leagues', 'About','Player Collection'];
  postString: string[]= ['Posts', 'Likes', 'Mentions'];
  achievementList: string[]= ['Collector 1', 'Gambler 1', 'Spender 1'];
  friendActions: string[] = ['3683211.png','add-friend-24.png'];
  selectedLink = 'link1';

  ownedPlayersDetails: PlayerWithClubDetails[] = [];
  currentUserID: string | undefined
  leagueIds: number[] = [];

  leagues: FriendsLeagueInterface[] = [];
  userLeagues: UserLeague[] = [];

  constructor(
    protected readonly authService: AuthService,
    private readonly supabase: SupabaseService,
    private readonly postService: PostsService,
    private readonly preferenceService: PreferencesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    protected readonly imageService: ImageDownloadService,
    protected dialog: MatDialog,
    protected readonly friendshipService: FriendshipService,
    private friendsLeague: FriendsLeague,
    private userService: UserServiceService,

  ) {
    this.supabase.supabaseClient
      .channel('realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        async () => {
          await this.loadPosts(this.profile?.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        async (payload) => {
          this.bgImageSafeUrl = await this.imageService.loadBackgroundImage(this.profile?.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        async () => {
          //await this.fetchFriends(this.profile?.id);
          await this.checkFriendStatus();
        }
      )
      .subscribe();
  }


  async ngOnInit(): Promise<void> {
    this.loading = true; // Start with loading set to true
    // Get the userId from the URL
    const urlUserId = this.route.snapshot.paramMap.get('userId');
    const authenticatedUserId = this.authService.session?.user?.id;
    this.currentUserID = authenticatedUserId;

    this.isOwnProfile = !urlUserId || (urlUserId === authenticatedUserId);
    this.userRefId = this.isOwnProfile ? null : urlUserId;

    try {
      const profileData = this.userRefId
        ? await this.getProfileById(this.userRefId)
        : await this.getProfile();

      // Set additional properties based on the profile
      this.username = this.profile?.username;
      this.avatarSafeUrl = await this.imageService.loadAvatarImage(this.profile?.id);
      this.bgImageSafeUrl = await this.imageService.loadBackgroundImage(this.profile?.id);
      if (this.userRefId) {
        await this.checkFriendStatus();
      }

      // Assuming `getProfile` and `getProfileById` set `this.profile`
      const preferencePromise = this.preferenceService.getPreferences(<string>this.profile?.id);
      const friendsPromise = this.fetchFriends(this.profile?.id);
      const postsPromise = this.loadPosts(this.profile?.id || '');

      // Wait for all promises to resolve
      const [preferences, , ] = await Promise.all([preferencePromise, friendsPromise, postsPromise]);
      this.preference = preferences;

      await this.loadUserLeagues(this.profile?.id);
      await this.updateOwnedPlayers();


      for (const preference of this.preference) {
        await this.sortPreference(preference);
      }

    } catch (error) {
      console.error('An error occurred during initialization:', error);
      // Handle the error properly
    } finally {
      this.loading = false; // Ensure loading is set to false after operations complete
    }
  }

  limitUsernameLength(username: string, maxLength: number): string {
    if (username.length > maxLength) {
      return `${username.slice(0, maxLength)}...`;
    }
    return username;
  }

  async sortPreference(preference: Preference): Promise<void> {
    if (preference.favorite_club) {
      this.favClub = await this.preferenceService.getClubByClubId(parseInt(preference.club_id));
      this.favoriteClub = this.favClub.name;
    } else if (preference.followed_club) {
      this.followingClub.push(await this.preferenceService.getClubByClubId(parseInt(preference.club_id)));
      this.followedClubs?.push(this.followingClub[this.followingClub.length - 1].name);
    }
  }

  checkVisitor(friendId: string|undefined):boolean{
    if(this.currentUserID==friendId){
      return false;
    }
    else{return true;}
  }
  getFollowingTeams(): string {
    return this.followingClub.map(club => club.name).join(', ');
  }

  async getProfile() {
    try {
      const user = this.authService.session?.user;
      if (user) {
        const {data: profile, error} = await this.authService.profile(user);
        if (error) {
          alert(error.message);
        }
        if (profile) {
          this.profile = profile;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async getProfileById(userId: string) {
    try {
      const {data: profile, error} = await this.authService.profileById(userId);
      if (error) {
        alert(error.message);
      }
      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  async loadPosts(userId: string | undefined) {
    if (userId === undefined) throw new Error('User ID is undefined');
      try{
        const posts = await this.postService.getPostsByUserId(userId);
        this.posts = posts.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (error) {
      console.error('Error loading posts:', error);
      }
  }

  async onPostClick(postId: number | undefined): Promise<void> {
    // Check if the user is authenticated
    this.authService.isAuthenticated$.subscribe(async isAuthenticated => {
      if (!isAuthenticated) {
        // If not authenticated, redirect to log in
        await this.router.navigate(['/login']);
      }
      else{
        if (postId === undefined) throw new Error('Post ID is undefined');
        await this.router.navigate(['/post', postId]);
      }
      // If authenticated, you can perform other actions, such as opening the post details
    });
  }


  changeContent(link: string): void {
    this.selectedLink = link;
  }

  openModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  addFriend(targetUserId?:string | undefined): void {
    // Assuming you have the target user's ID and the current user's ID available

    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID

    if (currentUserId) {
      const finalTargetUserId = targetUserId || this.userRefId;
      if (finalTargetUserId == null) {
        console.warn('Target user ID is undefined');
        // Handle the case where target user ID is not provided or undefined
        return;
      }
      this.friendshipService.addFriend(currentUserId, finalTargetUserId)
        .then(() => {
          this.friendRequestStatus = FriendRequestStatus.Requested;
          // You can update the UI accordingly
        })
        .catch(error => {
          console.error('Error sending friend request:', error);
          // Handle errors, perhaps show a message to the user
        });
    } else {
      console.error('User is not logged in');
      // Handle the case where the user is not logged in
    }
  }


  async checkFriendStatus(): Promise<void> {
    // Call the service to check the friend status
    if(this.userRefId == null) throw new Error('User ID is undefined');
    //console.log(this.userRefId);
    const targetUserId = this.userRefId;
    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID
    // This is a hypothetical method that you would need to implement
    const status = await this.friendshipService.checkFriendRequestStatus(currentUserId, targetUserId);
    //console.log(status);
    if(status === 'accepted') {
      this.friendRequestStatus = FriendRequestStatus.Friends;
    } else if (status === 'pending') {
      this.friendRequestStatus = FriendRequestStatus.Requested;
    }
  }

  handleFriendShips(targetUserId?: string | undefined): void {
    // Assuming you have the target user's ID and the current user's ID available
    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID

    if (currentUserId) {
      const finalTargetUserId = targetUserId || this.userRefId;
      if (finalTargetUserId == null) {
        console.warn('Target user ID is undefined');
        // Handle the case where target user ID is not provided or undefined
        return;
      }
      const status = this.friendshipService.checkIfFriends(currentUserId, finalTargetUserId)
        .catch(error => {
          console.error('Error removing friend:', error);
          // Handle errors, perhaps show a message to the user
        });

    } else {
      console.error('User is not logged in');
      // Handle the case where the user is not logged in
    }
  }


  removeFriend(targetUserId?:string|undefined): void {
    // Assuming you have the target user's ID and the current user's ID available
    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID

    if (currentUserId) {
      const finalTargetUserId = targetUserId || this.userRefId;
      if (finalTargetUserId == null) {
        console.warn('Target user ID is undefined');
        // Handle the case where target user ID is not provided or undefined
        return;
      }
      this.friendshipService.removeFriend(currentUserId, finalTargetUserId)
          .then(() => {
            //console.log('Friend removed');
            this.friendRequestStatus = FriendRequestStatus.None;
            // You can update the UI accordingly
          })
          .catch(error => {
            console.error('Error removing friend:', error);
            // Handle errors, perhaps show a message to the user
          });
    } else {
      console.error('User is not logged in');
      // Handle the case where the user is not logged in
    }
  }

  async fetchFriendships(userId: string | undefined): Promise<void> {
    if(userId === undefined) throw new Error('User ID is undefined');
    if (userId) {
      const friendIds = await this.friendshipService.getFriends(userId);
      for (const friendId of friendIds) {
        const friendProfile = await this.authService.profileById(friendId);
        if (friendProfile.data) {
          const avatarSafeUrl = await this.imageService.loadAvatarImage(friendProfile.data.id);
          this.friendsList.push({
            profile: friendProfile.data,
            avatarSafeUrl: avatarSafeUrl || '/assets/default-avatar.png' // Fallback to default image
          });
        }
      }
    }
  }

  async fetchFriends(userId: string | undefined): Promise<void> {
    const visitorId=  this.authService.session?.user?.id;
    if(userId === undefined) throw new Error('User ID is undefined');
    if(visitorId === undefined) throw new Error('User ID is undefined');
    if (userId) {
      const friendIds = await this.friendshipService.getFriends(userId);
      for (const friendId of friendIds) {
        const friendProfile = await this.authService.profileById(friendId);
        if (friendProfile.data) {
          const avatarSafeUrl = await this.imageService.loadAvatarImage(friendProfile.data.id);
          const friendBool = await this.friendshipService.checkIfFriends(friendId,visitorId);
          this.friendsList.push({
            profile: friendProfile.data,
            avatarSafeUrl: avatarSafeUrl || '/assets/default-avatar.png', // Fallback to default image
            commonFriend: friendBool
          });
        }
      }
    }
  }

  async onFriendClick(friendId: string | undefined): Promise<void> {
    if (friendId === undefined) throw new Error('Friend ID is undefined');
    await this.router.navigate(['/profile', friendId]);
  }



  //fetching player collection
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

  async updateOwnedPlayers() {
    const ownedPlayerIds = await this.getPurchasedPlayerIds(this.profile?.id);
    await this.fetchOwnedPlayersDetails(ownedPlayerIds);
  }

  async fetchOwnedPlayersDetails(ownedPlayerIds: number[]) {
    // Replace 'players' and 'clubs' with your actual table names
    const { data: playersData, error } = await this.supabase.supabaseClient
      .from('players')
      .select('*, clubs(name)') // Adjust the select statement to include the club name
      .in('id', ownedPlayerIds);

    if (error) {
      console.error('Error fetching player details:', error);
      return;
    }

    // Transform data to align with the PlayerWithClubDetails interface
    this.ownedPlayersDetails = playersData.map(player => ({
      ...player,
      clubname: player.clubs?.name, // Extract the club name
      owned: true // Since these are owned players
    }));
  }

  async loadUserLeagues(userId: string | undefined): Promise<void> {
    if(userId === undefined) throw new Error("Error");
    try {
      //console.log("Loading leagues for user ID:", userId);

      const leagueIds = await this.friendsLeague.getLeaguesIDForUser(userId);
      //console.log("Fetched league IDs:", leagueIds);
      const leagues = await this.friendsLeague.getLeaguesByIds(leagueIds);
      //console.log("Fetched league details:", leagues);

      const leagueMembers = await this.friendsLeague.getMembersForLeagues(leagueIds);
      //console.log("Fetched league members:", leagueMembers);

      let userLeaguesTemp: UserLeague[] = [];

      for (const league of leagues) {
        if (league.id !== undefined) {
          let members = leagueMembers[league.id] || [];
          //console.log(`Processing league: ${league.name}, Members:`, members);

          // Fetch usernames for each member
          members = await Promise.all(members.map(async (member) => {
            const username = await this.userService.getUsernameByID(member.userid);
            return { ...member, username };
          }));

          const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);
          const topMembers = sortedMembers.slice(0, 3);

          const isUserInTop = topMembers.some(member => member.userid === userId);
          let currentUserPosition = isUserInTop ? topMembers.findIndex(member => member.userid === userId) + 1 : undefined;
          let userPosition: number | string = "Not in league";

          if (!isUserInTop) {
            const userIndex = sortedMembers.findIndex(member => member.userid === userId);
            if (userIndex >= 0) {
              userPosition = userIndex + 1;
            }
          }

          userLeaguesTemp.push({
            leagueId: league.id,
            leagueName: league.name,
            userPosition,
            topMembers,
            currentUserPosition,
            isCurrentUserInTop: isUserInTop,
            currentUserInLeague: isUserInTop ? sortedMembers.find(member => member.userid === userId) || null : null
          });
          //console.log(`Processed league: ${league.name}`, userLeaguesTemp[userLeaguesTemp.length - 1]);
        }
      }

      this.userLeagues = userLeaguesTemp;
      //console.log("Final userLeagues data:", this.userLeagues);

    } catch (error) {
      console.error("Error loading leagues for user:", error);
    }
  }


  isCurrentUser(memberUserID: string): boolean {
    return this.currentUserID === memberUserID;
  }



}
