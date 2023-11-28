import {Component, Input, OnInit} from '@angular/core';
import {AuthService, Profile} from "../../../core/services/auth.service";
import {PostsService} from "../../../core/services/posts.service";
import {ActivatedRoute, Router} from "@angular/router";
import {PreferencesService} from "../../../core/services/preference.service";
import {AvatarService} from "../../../core/services/avatar.service";
import {SafeResourceUrl} from "@angular/platform-browser";
import {Post} from "../../../core/models/posts.model";
import {SupabaseService} from "../../../core/services/supabase.service";
import {SharedService} from "../../../core/services/shared.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.css']
})
export class CommonComponent implements OnInit{
  @Input() userRefId: string | null | undefined;
  isOwnProfile: boolean = false;
  loading = false;
  profile: Profile | undefined;
  username: string | undefined;
  avatarSafeUrl: SafeResourceUrl | undefined;
  posts: Post[] = [];
  infoString: string[]= ['Friends', 'Leagues', 'About'];
  postString: string[]= ['Posts', 'Likes', 'Mentions'];
  friendsList: string[]= ['Username 1', 'Username 2', 'Username 3', 'Username 4', 'Username 5', 'Username 6', 'Username 7', 'Username 8', 'Username 9', 'Username 10' ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username' ];
  leagueList: string[]= ['League 1','League 2','League 3','League 4','League 5','League 6','League 7','League 8','League 9'];
  imageList: string[]= ['KV-Kortrijk-wallpaper.jpg','unnamed.jpg','v2_large_8717893f85b4c67b835c8b9984d0115fbdb37ecf.jpg','vieren-KV-Kortrijk-21-10-2023.jpg'];
  friendActions: string[] = ['3683211.png','add-friend-24.png'];
  selectedLink: string = 'link1';

  constructor(
    protected readonly authService: AuthService,
    private readonly supabase: SupabaseService,
    private readonly postService: PostsService,
    private readonly preferenceService: PreferencesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly avatarService: AvatarService,
    private sharedService: SharedService,
    protected dialog: MatDialog

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
        (payload) => {
          this.loadPosts(this.profile?.id);
        }
      )
      .subscribe();

  }

  async ngOnInit(): Promise<void> {
    // Get the userId from the URL
    const urlUserId = this.route.snapshot.paramMap.get('userId');
    const authenticatedUserId = this.authService.session?.user?.id;

    if(urlUserId == null){
      this.isOwnProfile = true;
    }
    else if (urlUserId && authenticatedUserId && urlUserId === authenticatedUserId) {
      // If the userId from URL is the same as the authenticated user's ID, set userRefId to null
      this.userRefId = null;
      this.isOwnProfile = true;
    } else {
      // Otherwise, use the userId from the URL
      this.userRefId = urlUserId;
      this.isOwnProfile = false;
    }

    if(this.userRefId != null){
      this.getProfileById(this.userRefId).then(async () => {
        this.username = this.profile?.username;
        this.avatarSafeUrl = await this.avatarService.loadAvatarImage(this.profile?.id);
        await this.loadPosts(this.profile?.id || '');
      });

    }
    else{
    this.getProfile().then(async () => {
      this.username = this.profile?.username;
      this.avatarSafeUrl = await this.avatarService.loadAvatarImage(this.profile?.id);
      await this.loadPosts(this.profile?.id || '');
    });
  }

  }



  async getProfile() {
    try {
      this.loading = true;
      const user = this.authService.session?.user;
      if (user) {
        const {data: profile, error} = await this.authService.profile(user);
        if (error) {
          alert(error.message);
        }
        if (profile) {
          this.profile = profile;
          this.sharedService.sharedProfile = profile;
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

  async getProfileById(userId: string) {
    try {
      this.loading = true;
      const {data: profile, error} = await this.authService.profileById(userId);
      if (error) {
        alert(error.message);
      }
      if (profile) {
        this.profile = profile;
        this.sharedService.sharedProfile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async loadPosts(userId: string | undefined) {
    if (userId === undefined) throw new Error('User ID is undefined');
      try{
        let posts = await this.postService.getPostsByUserId(userId);
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
        // If not authenticated, redirect to login
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
      console.log(this.friendsList);
    }
  }

  closeModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }


}
