// posts-view.component.ts
import {Component, Input, OnInit} from '@angular/core';
import {Like, Post  } from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {PostsService} from "../../../core/services/posts.service";
import {Router} from "@angular/router";
import {CreatePostComponent} from "../create-post/create-post.component";
import {MatDialog} from "@angular/material/dialog";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";

@Component({
    selector: 'app-post-view',
    templateUrl: './post-view.component.html',
    styleUrls: ['./post-view.component.css']
})
export class PostViewComponent implements OnInit {
    @Input() post!: Post;
    @Input() originalPost?: Post;
    @Input() clickable: boolean = true; // New input property

    originalPostImageUrl?: SafeResourceUrl;
    loading = false;
    profile: Profile | undefined;
    username: string | undefined;
    usernameRetweeted: string | undefined;
    avatarSafeUrl: SafeResourceUrl | undefined;
    retweetAvatarSafeUrl: SafeResourceUrl | undefined;
    postSafeUrl: SafeResourceUrl | undefined;
    likeCounts: { [key: number]: number } = {}; // Object to hold the like counts for each post
    commentCounts: { [key: number]: number } = {}; // Object to hold the comment counts for each post
    retweetCounts: { [key: number]: number } = {}; // Object to hold the retweet counts for each post
    //liking a post
    likedPosts: Set<number> = new Set(); // Holds the IDs of liked posts

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserServiceService,
        private readonly postService: PostsService,
        private readonly router: Router,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog,
        private imageDownloadService: ImageDownloadService

    ) {
    }

    async ngOnInit() {
        // Load profile
        await this.getProfile();
        await this.getUsernameById(this.post.user_id);

        // Load avatar image
        if (this.post.user_id) {
            this.avatarSafeUrl = await this.imageDownloadService.loadAvatarImage(this.post.user_id);
        }

        // Load post image
        if (this.post.image_url) {
            this.postSafeUrl = await this.imageDownloadService.loadPostImage(this.post.image_url);
        }

        if (this.post.original_post_id) {
            await this.loadOriginalPost(this.post.original_post_id);
        }

        // Load interactions
        await this.checkIfLiked(this.post.id);
        await this.loadLikeCount(this.post.id);
        await this.loadCommentCount(this.post.id);
        await this.loadRetweetCount(this.post.id);
    }

    private async loadOriginalPost(originalPostId: number) {
        try {
            this.originalPost = await this.postService.getOriginalPost(originalPostId)
            if (this.originalPost.image_url) {
                this.originalPostImageUrl = await this.imageDownloadService.loadPostImage(this.originalPost.image_url);
            }


            if(this.originalPost.user_id){
                await this.getUsernameRetweetedById(this.originalPost.user_id)
                this.retweetAvatarSafeUrl = await this.imageDownloadService.loadAvatarImage(this.originalPost.user_id);
            }
        } catch (error) {
            console.error('Error loading original post:', error);
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

    //Like Logic
    toggleLike(postId: number | undefined) {
        if (postId === undefined) throw new Error('Post ID is undefined');

        if (this.likedPosts.has(postId)) {
            this.likedPosts.delete(postId);
            // Optionally handle unlike logic
            this.unlikePost(postId).then(r => console.log('Post unliked:', r));
        } else {
            this.likedPosts.add(postId);
            // Handle like logic
            this.likePost(postId).then(r => console.log('Post liked:', r));
        }

        this.loadLikeCount(this.post.id).then(r => console.log('Like count:', r));

    }

    isLiked(postId: number | undefined): boolean {
        return this.likedPosts.has(<number>postId);
    }

    async loadLikeCount(postId: number | undefined) {
        if (postId === undefined) throw new Error('Post ID is undefined');
        this.likeCounts[postId] = await this.postService.getNumberOfLikes(postId);
    }

    getLikeCount(postId: number | undefined): number {
        // This method is now a simple getter that will return the resolved like count
        if (postId === undefined) throw new Error('Post ID is undefined');
        return this.likeCounts[postId] || 0;
    }

    async likePost(postId: number | undefined) {
        try {
            // Assuming you have a 'like' model and the 'likePost' method in your PostsService.
            // You would also need to pass the user ID of the person liking the post.
            const user = this.authService.session?.user;
            if (!user || !user.id) throw new Error('User ID is undefined');

            // The 'like' model might include fields like post_id and user_id
            if (postId === undefined) throw new Error('Post ID is undefined');
            const like: Like = {
                post_id: postId,
                user_id: user.id,
                created_at: new Date(),
            };
            await this.postService.likePost(like);
// Optionally, you can emit an event or call a method to update the UI accordingly.
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error liking post:', error.message);
            }
        }

        await this.loadLikeCount(this.post.id);
    }

    async unlikePost(postId: number | undefined) {
        try {
            // Assuming you have a 'like' model and the 'likePost' method in your PostsService.
            // You would also need to pass the user ID of the person liking the post.
            const user = this.authService.session?.user;
            if (!user || !user.id) throw new Error('User ID is undefined');

            // The 'like' model might include fields like post_id and user_id
            if (postId === undefined) throw new Error('Post ID is undefined');
            const like: Like = {
                post_id: postId,
                user_id: user.id,
                created_at: new Date(),
            };
            await this.postService.unlikePost(like);
// Optionally, you can emit an event or call a method to update the UI accordingly.
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error liking post:', error.message);
            }
        }

        this.loadLikeCount(this.post.id).then(r => console.log('Like count:', r));

    }

    async checkIfLiked(postId: number | undefined): Promise<boolean> {
        try {
            const user = this.authService.session?.user;
            if (!user || !user.id) throw new Error('User ID is undefined');

            if (postId === undefined) throw new Error('Post ID is undefined');
            const isLiked = await this.postService.checkIfLiked(postId, user.id);
            if (isLiked) {
                this.likedPosts.add(postId);
            }

            return isLiked;
        } catch (error) {
            console.error('Error checking if liked:', error);
            return false;
        }
    }

    //Comment Logic
    getCommentCount(postId: number | undefined): number {
        if (postId === undefined) throw new Error('Post ID is undefined');
        return this.commentCounts[postId] || 0;
    }

    async loadCommentCount(postId: number | undefined) {
        if (postId === undefined) throw new Error('Post ID is undefined');
        this.commentCounts[postId] = await this.postService.getNumberOfComments(postId);
    }

    async commentPost(postId: number | undefined) {
        if (postId === undefined) throw new Error('Post ID is undefined');
        await this.router.navigate(['/post', postId]); // Assuming '/post/:id' is the route for the single post view
    }

    //Retweet Logic
    async loadRetweetCount(postId: number | undefined) {
        if (postId === undefined) throw new Error('Post ID is undefined');
        this.retweetCounts[postId] = await this.postService.getNumberOfRetweets(postId);
    }

    getRetweetCount(postId: number | undefined): number {
        if (postId === undefined) throw new Error('Post ID is undefined');
        return this.retweetCounts[postId] || 0;
    }

    openCreatePostModal(): void {
        const dialogRef = this.dialog.open(CreatePostComponent, {
            width: '600px',
            data: {originalPost: this.post}
        });

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
        });
    }


    //Create UserService to Retrieve Username from user_id
    async getUsernameById(id: string): Promise<any> {
        this.userService.getUsernameByID(id).then(username => {
            this.username = username;
        }).catch(error => {
            console.error('Could not fetch username', error);
        });
    }

    async getUsernameRetweetedById(id: string): Promise<any> {
        this.userService.getUsernameByID(id).then(username => {
            this.usernameRetweeted = username;
        }).catch(error => {
            console.error('Could not fetch username', error);
        });
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
                window.location.reload();
            }
        }
        )
    }

    async onAvatarClick(userId: string | undefined): Promise<void> {
      if (userId === undefined) throw new Error('User ID is undefined');
      await this.router.navigate(['/profile', userId]);
    }
}
