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

export enum FriendRequestStatus {
  None = 'none',
  Requested = 'requested',
  Friends = 'friends'
}

interface FriendInfo {
  profile: Profile;
  avatarSafeUrl: SafeResourceUrl;
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
  followiedClubs: string[] | undefined;
  friendRequestStatus: FriendRequestStatus = FriendRequestStatus.None;
  friendsList: FriendInfo[] = []; // Array to store friends' info



  testfriendsList: string[]= ['Username', 'Username',  'Username', 'Username','Username', 'Username', 'Username',  'Username',  'Username', 'Username',  'Username', 'Username',  'Username', 'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  'Username',  ];
  infoString: string[]= ['Friends', 'Leagues', 'About','Badges'];
  postString: string[]= ['Posts', 'Likes', 'Mentions'];
  leagueList: string[]= ['League 1','League 2','League 3','League 4','League 5','League 6','League 7','League 8','League 9'];
  imageList: string[]= ['KV-Kortrijk-wallpaper.jpg','unnamed.jpg','v2_large_8717893f85b4c67b835c8b9984d0115fbdb37ecf.jpg','vieren-KV-Kortrijk-21-10-2023.jpg'];
  friendActions: string[] = ['3683211.png','add-friend-24.png'];
  selectedLink = 'link1';
  selectedBadge = 'KV_Kortrijk_logo.svg';
  badgeList: string[]= ['Belgian_Pro_League_logo.svg', 'Club_Brugge_KV_logo.svg', 'KAA_Gent_logo.svg', 'Kas_Eupen_Logo.svg','KRC_Genk_Logo_2016.svg','KV_Kortrijk_logo.svg','KV_Mechelen_logo.svg','kvc-westerlo.svg','OHL.svg','Logo_RWDMolenbeek.svg','oud-heverlee-leuven-seeklogo.com-3.svg','R-Logo-04.svg','Royal_Antwerp_Football_Club_logo.svg','Royal_Belgian_FA_logo_2019.svg','Royal_Charleroi_Sporting_Club_logo.svg','Royal_Standard_de_Liege.svg','RSC_Anderlecht_logo.svg','union-saint-gilloise.svg','VV_St._Truiden_Logo.svg','Logo_Cercle_Bruges_KSV_-_2022.svg' ];

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
  ) {
    this.supabase.supabaseClient
      .channel('realtime-posts')
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
      .subscribe();


    this.supabase.supabaseClient
      .channel('realtime-preferences')
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
      .subscribe();
  }

  async ngOnInit(): Promise<void> {
    this.loading = true; // Start with loading set to true
    // Get the userId from the URL
    const urlUserId = this.route.snapshot.paramMap.get('userId');
    const authenticatedUserId = this.authService.session?.user?.id;

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



  async sortPreference(preference: Preference): Promise<void> {
    if (preference.favorite_club) {
      this.favClub = await this.preferenceService.getClubByClubId(parseInt(preference.club_id));
      this.favoriteClub = this.favClub.name;
    } else if (preference.followed_club) {
      this.followingClub.push(await this.preferenceService.getClubByClubId(parseInt(preference.club_id)));
      this.followiedClubs?.push(this.followingClub[this.followingClub.length - 1].name);
    }
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

  badgeDisplayed(badge:string): void {
    this.selectedBadge = badge;
  }
  changeContent(link: string): void {
    this.selectedLink = link;
  }

  openModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.add('active');
      console.log(this.friendsList);
    }
  }

  closeModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  addFriend(): void {
    // Assuming you have the target user's ID and the current user's ID available
    if(this.userRefId == null) throw new Error('User ID is undefined');
    const targetUserId = this.userRefId;
    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID

    if (currentUserId) {
      this.friendshipService.addFriend(currentUserId, targetUserId)
        .then(() => {
          console.log('Friend request sent');
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

  removeFriend(): void {
    // Assuming you have the target user's ID and the current user's ID available
    if(this.userRefId == null) throw new Error('User ID is undefined');
    const targetUserId = this.userRefId;
    const currentUserId = this.authService.session?.user?.id; // Or however you retrieve the current user's ID

    if (currentUserId) {
      this.friendshipService.removeFriend(currentUserId, targetUserId)
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


  async fetchFriends(userId: string | undefined): Promise<void> {
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

  async onFriendClick(friendId: string | undefined): Promise<void> {
    if (friendId === undefined) throw new Error('Friend ID is undefined');
    await this.router.navigate(['/profile', friendId]).then(() => {
      window.location.reload();
    });
  }


}
