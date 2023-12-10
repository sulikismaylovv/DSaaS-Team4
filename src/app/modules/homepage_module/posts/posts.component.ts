import {Component, OnInit} from '@angular/core';
import {PostsService} from 'src/app/core/services/posts.service';
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {SupabaseService} from "../../../core/services/supabase.service";
import {MatDialog} from "@angular/material/dialog";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {PreferencesService} from "../../../core/services/preference.service";

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
    posts: Post[] = [];
    avataUrl: SafeResourceUrl | undefined;
    profile: Profile | undefined;
    followedClubIds: number[] = [];


  constructor(
        private readonly postsService: PostsService,
        private readonly supabase: SupabaseService,
        protected readonly authService: AuthService,
        private readonly sanitizer: DomSanitizer,
        protected readonly router: Router,
        private readonly preferenceService: PreferencesService,
        public dialog: MatDialog

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
              async (payload) => {
                await this.loadPosts();
                }
            )
            .subscribe();
    }

    async ngOnInit() {
        await this.getProfile();

        if (this.profile && this.profile.avatar_url) {
            try {
                const {data} = await this.authService.downLoadImage(this.profile.avatar_url)
                if (data instanceof Blob) {
                    this.avataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error downloading image: ', error.message)
                }
            }
        }
        await this.loadPosts();
    }


  async loadUserPreferences() {
    // Replace with your actual preference fetching logic
    const preferences = await this.preferenceService.getPreferences(<string>this.authService.session?.user?.id);

    // Parse the followed club IDs as numbers
    this.followedClubIds = preferences
      .filter(p => p.followed_club)
      .map(p => parseInt(p.club_id))
      .filter(id => !isNaN(id)); // Filter out any NaN results from parseInt

  }
    async getProfile() {
        try {
            await this.authService.restoreSession();
            const user = this.authService.session?.user;
            if (user) {
                const {data: profile, error} = await this.authService.profile(user);
                if (error) {
                    throw error;
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

  async loadPosts() {
    // Load user preferences if profile.id is defined
    if (this.profile?.id) {
      await this.loadUserPreferences();
      // console.log('Followed Club IDs:', this.followedClubIds);
      //console.log('Favorite Club ID:', this.favoriteClubId);
    }

    try {
      let posts = await this.postsService.getPosts();

      // Filter and sort posts
      this.posts = posts
        .filter(post => {
          // Keep non-official posts or when profile.id is not defined
          if (!post.is_official || !this.profile?.id) return true;

          // If the post is official, ensure club0 and club1 are not null
          if (post.club0 == null || post.club1 == null) return false;

          return this.followedClubIds.includes(post.club0) || this.followedClubIds.includes(post.club1);
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }


  openCreatePostModal(): void {
        const dialogRef = this.dialog.open(CreatePostComponent,
        {
            panelClass: 'mat-dialog-container',
            width: '700px',
            data: 0 // 0 means no original post

        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

  // Function to handle post click
  async onPostClick(postId: number | undefined): Promise<void> {
    // Check if the user is authenticated
    this.authService.isAuthenticated$.subscribe(async isAuthenticated => {
        if (!isAuthenticated) {
          // If not authenticated, redirect to log in
            await this.router.navigate(['/login']);
        }
        else{
          if (postId === undefined) throw new Error('Post ID is undefined');
          //await this.router.navigate(['/post', postId]);
        }
        // If authenticated, you can perform other actions, such as opening the post details
    });
    }



}
