import {Component, OnInit} from '@angular/core';
import {PostsService} from 'src/app/core/services/posts.service';
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {SupabaseService} from "../../../core/services/supabase.service";
import {MatDialog} from "@angular/material/dialog";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Router} from "@angular/router";

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
    posts: Post[] = [];
    avataUrl: SafeResourceUrl | undefined;
    profile: Profile | undefined;

    constructor(
        private readonly postsService: PostsService,
        private readonly supabase: SupabaseService,
        protected readonly authService: AuthService,
        private readonly sanitizer: DomSanitizer,
        protected readonly router: Router,
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
                (payload) => {
                    this.loadPosts();
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
        try {
            let posts = await this.postsService.getPosts();

            // Sort posts based on sortDate
            this.posts = posts.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    openCreatePostModal(): void {
        const dialogRef = this.dialog.open(CreatePostComponent, {
            width: '700px',
            data: 0
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

}
