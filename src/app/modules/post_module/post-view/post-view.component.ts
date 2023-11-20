// posts-view.component.ts
import { Component, Input, OnInit } from '@angular/core';
import {Post} from "../../../core/models/posts.model";
import {AuthService, Profile} from "../../../core/services/auth.service";

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css']
})
export class PostViewComponent implements OnInit {
  @Input() post!: Post;
  loading = false;
  profile: Profile | undefined;

  constructor(
    private readonly authService: AuthService,
  ) {}

  async ngOnInit() {
    console.log('Post:', this.post);
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


  //Create UserService to Retrieve Username from user_id
}
