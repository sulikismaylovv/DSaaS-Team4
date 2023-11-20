import {Component, OnInit} from '@angular/core';
import {PostsService} from "../../../core/services/posts.service";
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit{
  postContent: string = '';
  loading = false;
  profile: Profile | undefined;
  selectedImage: File | null = null;

  constructor(
    private postsService: PostsService,
    private readonly authService: AuthService,
  ) { }

  async ngOnInit() {
    await this.getProfile();
  }

  async getProfile() {
    try {
      this.loading = true;
      const user = this.authService.session?.user;
      if (user) {
        const { data: profile, error } = await this.authService.profile(user);
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

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      this.selectedImage = target.files[0];
    }
  }

  async onSubmit(): Promise<void> {

    try {
      const user = this.authService.session?.user;
      if (!user || !user.id) throw new Error('User ID is undefined');


      const post: Post = {
        createdAt: new Date(), userId: user.id,
        // Assuming 'content' is a property of your Post model
        content: this.postContent
        // Other required properties for the Post model can be set here
      };

      if (this.selectedImage) {
        const createdPost = await this.postsService.createPost(post, this.selectedImage);
        console.log('Post created:', createdPost);
      }

      // Clear the form
      this.postContent = '';
      this.selectedImage = null;
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }
}
