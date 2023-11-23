import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {PostsService} from "../../../core/services/posts.service";
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {UserServiceService} from "../../../core/services/user-service.service";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  postContent: string = '';
  loading = false;
  profile: Profile | undefined;
  usernameRetweeted: string | undefined;
  selectedImage: File | null = null;
  avatarSafeUrl: SafeResourceUrl | undefined;
  originalPostAvatar?: SafeResourceUrl | undefined; // URL of the original post's user avatar
  originalPostImage?: SafeResourceUrl | undefined; // URL of the original post's image

  public uploading: boolean | undefined;

  @Output() postCreated = new EventEmitter<boolean>(); // Emit a boolean for simplicity
  imagePreview: string | ArrayBuffer | null | undefined;


  constructor(
    private postsService: PostsService,
    private readonly authService: AuthService,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<CreatePostComponent>,
    private readonly userService: UserServiceService,
    @Inject(MAT_DIALOG_DATA) public data: {originalPost? : Post} // If you need to pass data
  ) {
  }


  async ngOnInit() {
    console.log(this.data.originalPost);
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

    if (this.data.originalPost) {
      await this.getUsernameRetweetedById(this.data.originalPost.user_id)
      // Load the avatar of the user who made the original post
      // Assuming you have a method to get a user's avatar by their user_id
      try {
        const {data} = await this.authService.downLoadImage(await this.getAvatarUrlByID(this.data.originalPost.user_id))
        if (data instanceof Blob) {
          this.originalPostAvatar = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error downloading image: ', error.message)
        }
      }

      // Set the image preview to the original post's image if it exists
      //this.originalPostImage = this.data.originalPost.image_url;
      if (this.data.originalPost.image_url) {
      try {
        const data = await this.postsService.downLoadImage(this.data.originalPost.image_url);
        if (data instanceof Blob) {
          this.originalPostImage = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));
        }
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
    }


  }

  async getProfile() {
    try {
      this.loading = true;
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
    } finally {
      this.loading = false;
    }
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

    if (this.data.originalPost) {
      post.original_post_id = this.data.originalPost.id; // Set the ID of the original post
    }

    if (this.selectedImage) {
      // Get file extension and generate a random file path
      const fileExt = this.selectedImage.name.split('.').pop();
      const filePath = `post-images/${Math.random()}.${fileExt}`;

      // Call createPost with the image file and path
      this.postsService.createPost(post, this.selectedImage, filePath)
        .then(createdPost => {
          this.dialogRef.close(createdPost); // Close the modal and pass the new post back
          // Emit an event if needed, e.g., to inform a parent component
          this.postCreated.emit(true);
        })
        .catch(error => {
          console.error('Error creating post:', error);
        })
        .finally(() => {
          this.resetForm()
        });
    } else {
      // Call createPost without image file and path
      this.postsService.createPost(post, null, '')
        .then(createdPost => {
          this.dialogRef.close(createdPost); // Close the modal and pass the new post back
          // Emit an event if needed, e.g., to inform a parent component
          this.postCreated.emit(true);
        })
        .catch(error => {
          console.error('Error creating post:', error);
        })
        .finally(() => {
          this.resetForm()
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

   resetForm(): void {
    this.dialogRef.close();
    this.uploading = false;
    this.postContent = '';
    this.selectedImage = null;
    this.imagePreview = null;
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
