import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PostsService} from "../../../core/services/posts.service";
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {delay} from "utils-decorators";

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
  imagePreview: string | ArrayBuffer | null | undefined;


  constructor(
    private postsService: PostsService,
    private readonly authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {
  }


  async ngOnInit() {
    await this.cancelPost();
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

  async cancelPost(): Promise<void> {
    // Clear the form fields
    this.postContent = '';
    this.selectedImage = null;
    this.imagePreview = null;
  }


  // This method should be triggered only when the "Post" button is clicked
  async onSubmit(): Promise<void> {
    if (!this.postContent.trim()) {
      alert('Please enter some content for your post.');
      return;
    }

    this.uploading = true;

    const user = this.authService.session?.user;
    if (!user || !user.id) throw new Error('User ID is undefined');

    const post: Post = {
      content: this.postContent,
      created_at: new Date(),
      user_id: user.id,
    };

    if (this.selectedImage) {
      // Get file extension and generate a random file path
      const fileExt = this.selectedImage.name.split('.').pop();
      const filePath = `post-images/${Math.random()}.${fileExt}`;

      // Call createPost with the image file and path
      this.postsService.createPost(post, this.selectedImage, filePath)
        .then(createdPost => {
          console.log('Post created:', createdPost);
          // Emit an event if needed, e.g., to inform a parent component
          this.upload.emit('Post created successfully.');
          window.location.reload();
        })
        .catch(error => {
          console.error('Error creating post:', error);
        })
        .finally(() => {
          this.uploading = false;
          // Clear the form
          this.postContent = '';
          this.selectedImage = null;
          this.imagePreview = null;
        });
    } else {
      // Call createPost without image file and path
      this.postsService.createPost(post, null, '')
        .then(createdPost => {
          console.log('Post created:', createdPost);
          // Emit an event if needed, e.g., to inform a parent component
          this.upload.emit('Post created successfully.');
          window.location.reload()
        })
        .catch(error => {
          console.error('Error creating post:', error);
        })
        .finally(() => {
          this.uploading = false;
          // Clear the form
          this.postContent = '';
          this.selectedImage = null;
          this.imagePreview = null;
        });
    }
  }


  // Separate method to handle file selection
  onImageSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedImage = fileList[0];

      // Generate a preview of the first selected file
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }


}
