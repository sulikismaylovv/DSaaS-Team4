// posts-view.component.ts
import {Component, Input, OnInit} from '@angular/core';
import {Like, Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {PostsService} from "../../../core/services/posts.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css']
})
export class PostViewComponent implements OnInit {
  @Input() post!: Post;
  loading = false;
  profile: Profile | undefined;
  username: string | undefined;
  avatarSafeUrl: SafeResourceUrl | undefined;
  postSafeUrl: SafeResourceUrl | undefined;
  likeCounts: { [key: number]: number } = {}; // Object to hold the like counts for each post
  commentCounts: { [key: number]: number } = {}; // Object to hold the comment counts for each post
  //liking a post
  likedPosts: Set<number> = new Set(); // Holds the IDs of liked posts

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserServiceService,
    private readonly postService: PostsService,
    private readonly router: Router,
    private sanitizer: DomSanitizer,
  ) {
  }

  async ngOnInit() {
    await this.getProfile();
    console.log('post:', this.post);
    console.log("post.created_at:", this.post.created_at);
    await this.getUsernameById(this.post.user_id);

    if (this.post && this.post.user_id) {
      try {
        const {data} = await this.authService.downLoadImage(await this.getAvatarUrlByID(this.post.user_id))
        if (data instanceof Blob) {
          this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }
    }

    if (this.post && this.post.image_url) {
      try {
        const data = await this.postService.downLoadImage(this.post.image_url);
        if (data instanceof Blob) {
          this.postSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }
    }

    await this.checkIfLiked(this.post.id);
    await this.loadLikeCount(this.post.id);
    await this.loadCommentCount(this.post.id);

  }

  async getProfile() {
    try {
      this.loading = true;
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
    console.log('Liking post with ID:', postId);
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

      const likedPost = await this.postService.likePost(like);
      console.log('Post liked:', likedPost);

      // Optionally, you can emit an event or call a method to update the UI accordingly.
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error liking post:', error.message);
      }
    }

    await this.loadLikeCount(this.post.id);
  }

  async unlikePost(postId: number | undefined) {
    console.log('Unliking post with ID:', postId);
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

      const likedPost = await this.postService.unlikePost(like);
      console.log('Post liked:', likedPost);

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




  //Create UserService to Retrieve Username from user_id
  async getUsernameById(id: string): Promise<any> {
    console.log('id:', id);
    this.userService.getUsernameByID(id).then(username => {
      this.username = username;
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
