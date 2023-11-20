// posts-view.component.ts
import { Component, Input, OnInit } from '@angular/core';
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {PostsService} from "../../../core/services/posts.service";

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



  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserServiceService,
    private readonly postService: PostsService,
    private sanitizer: DomSanitizer,

  ) {}

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
        if(data instanceof Blob){
        this.postSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(data));}
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
