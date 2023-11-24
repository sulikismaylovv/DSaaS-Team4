import {Component, OnInit} from '@angular/core';
import {PostsService} from 'src/app/core/services/posts.service';
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {SupabaseService} from "../../../core/services/supabase.service";
import {MatDialog} from "@angular/material/dialog";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

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
        private readonly authService: AuthService,
        private readonly sanitizer: DomSanitizer,
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



    async getOriginalPostDate(original_post_id: number): Promise<Date> {
        const originalPost = await this.postsService.getOriginalPost(original_post_id);
        return new Date(originalPost.created_at);
    }
}
