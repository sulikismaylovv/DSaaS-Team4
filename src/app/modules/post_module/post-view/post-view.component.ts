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

@Component({
    selector: 'app-post-view',
    templateUrl: './post-view.component.html',
    styleUrls: ['./post-view.component.css']
})
export class PostViewComponent implements OnInit {
    @Input() post!: Post
    originalPost?: Post;
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
        public dialog: MatDialog

    ) {
    }

    async ngOnInit() {
        await this.getProfile();
        await this.getUsernameById(this.post.user_id);

        // Load avatar image
        if (this.post.user_id) {
            await this.loadAvatarImage(this.post.user_id);
        }

        // Load post image
        if (this.post.image_url) {
            await this.loadPostImage(this.post.image_url);
        }

        if (this.post.original_post_id) {
            console.log('Original post ID:', this.post.original_post_id);
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
            console.log('Original post:', this.originalPost);
            if (this.originalPost.image_url) {
                const data = await this.postService.downLoadImage(this.originalPost.image_url);
                if (data instanceof Blob) {
                    this.originalPostImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
                }
            }


            if(this.originalPost.user_id){
                await this.getUsernameRetweetedById(this.originalPost.user_id)
                const { data } = await this.authService.downLoadImage(await this.getAvatarUrlByID(this.originalPost.user_id));
                if (data instanceof Blob) {
                    this.retweetAvatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
                }
            }
        } catch (error) {
            console.error('Error loading original post:', error);
        }
    }


    private async loadAvatarImage(userId: string) {
        try {
            const { data } = await this.authService.downLoadImage(await this.getAvatarUrlByID(userId));
            if (data instanceof Blob) {
                this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
            }
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    }

    private async loadPostImage(imageUrl: string) {
        try {
            const data = await this.postService.downLoadImage(imageUrl);
            if (data instanceof Blob) {
                this.postSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
            }
        } catch (error) {
            console.error('Error downloading image:', error);
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


    async getAvatarUrlByID(id: string) {
        return this.userService.getUserByID(id).then(user => {
            return user.avatar_url;

        }).catch(error => {
            console.error('Could not fetch avatar_url', error);
        });
    }
}
