import { Component, OnInit, Input } from '@angular/core';
import { Post, Comment } from "../../../core/models/posts.model";
import { PostsService } from "../../../core/services/posts.service";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {SupabaseService} from "../../../core/services/supabase.service";
import { Location } from '@angular/common';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.css']
})

export class SinglePostComponent implements OnInit {
  @Input() post!: Post; // The post to which the comments belong
  @Input() originalPost?: Post; // The original post
  comments: Comment[] = []; // Array to store comments
  avatarSafeUrl: SafeResourceUrl | undefined;
  loading = true;
  profile: Profile | undefined;
  commentContent: string = '';
  constructor(
    private route: ActivatedRoute,
    private readonly postsService: PostsService,
    private readonly authService: AuthService,
    private readonly sanitizer: DomSanitizer,
    private readonly supabase: SupabaseService,
    private readonly router: Router,
    private location: Location
  ) {
    this.supabase.supabaseClient
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          this.loadComments();
        }
      )
      .subscribe();
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const postId = +this.route.snapshot.params['id'];
    if (postId) {
      this.post = await this.postsService.getPostById(postId);

      if (this.post.original_post_id != undefined) {
        this.originalPost = await this.postsService.getPostById(this.post.original_post_id);
      }
    }
    console.log('Post:', this.post);
    console.log('Original post:', this.originalPost);


    await this.getProfile();

    if (this.profile && this.profile.avatar_url) {
      try {
        const {data} = await this.authService.downLoadImage(this.profile.avatar_url)
        if (data instanceof Blob) {
          this.avatarSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }
    }
    this.loadComments().then(r => console.log("loadComments() finished"));
    this.loading = false;
  }

  async getProfile() {
    try {
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
      this.loading = false;}
  }

  async loadComments() {
    if (this.post && this.post.id) {
      this.comments = await this.postsService.getCommentsByPostId(this.post.id);
    }
  }

  async postComment() {
    const user = this.authService.session?.user;
    if (!user || !user.id) {
      alert('You must be logged in to post a comment.');
      return;
    }

    if(this.post.id === undefined) throw new Error("post.id is undefined");

    const newComment: Comment = {
      content: this.commentContent,
      post_id: this.post.id,
      user_id: user.id,
      created_at: new Date()
    };

    try {
      const createdComment = await this.postsService.addComment(newComment);
      console.log('Created comment:', createdComment);
      this.comments.push(createdComment);
      this.commentContent = ''; // Clear the input after posting
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('There was an error posting your comment.');
    }
  }

  async cancelComment() {
    this.commentContent = ''; // Clear the comment input
  }

  async onAvatarClick(userId: string | undefined) {
    if (userId === undefined) throw new Error('User ID is undefined');
    await this.router.navigate(['/profile', userId]);
  }
  goBack(): void {
    this.location.back(); // This will navigate back to the previous location in the browser history
  }
}
