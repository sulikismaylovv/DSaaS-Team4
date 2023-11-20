import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PostsService} from "../../../core/services/posts.service";
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  postContent: string = '';
  loading = false;
  profile: Profile | undefined;
  selectedImage: File | null = null;
  avatarSafeUrl: SafeResourceUrl | undefined;
  public uploading: boolean | undefined;

  @Output() upload = new EventEmitter<string>()



  constructor(
    private postsService: PostsService,
    private readonly authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {
  }

  async ngOnInit() {
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


  async onSubmit(event: any): Promise<void> {

    try {
      const user = this.authService.session?.user;
      if (!user || !user.id) throw new Error('User ID is undefined');


      const post: Post = {
        created_at: new Date(), user_id: user.id,
        // Assuming 'content' is a property of your Post model
        content: this.postContent
      };

      try {
        this.uploading = true
        if (!event.target.files || event.target.files.length === 0) {
          throw new Error('You must select an image to upload.')
        }

        const file = event.target.files[0]
        const fileExt = file.name.split('.').pop()
        const filePath = `${Math.random()}.${fileExt}`

        const createdPost = await this.postsService.createPost(post, file, filePath);
        console.log('Post created:', createdPost);

      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        this.uploading = false
      }
      // Clear the form
      this.postContent = '';
      this.selectedImage = null;

    } catch (error) {
      console.error('Error creating post:', error);
    }
  }


}
