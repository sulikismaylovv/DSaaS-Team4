import {Component, Input} from '@angular/core';
import {Comment} from "../../../core/models/posts.model";
import {UserServiceService} from "../../../core/services/user-service.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrls: ['./comment-view.component.css']
})
export class CommentViewComponent {
  @Input() comment!: Comment;
  username: string | undefined;
  avatarSafeUrl: SafeResourceUrl | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserServiceService,
    private readonly sanitizer: DomSanitizer,
  ) {
  }

  async ngOnInit() {
    console.log('comment:', this.comment);
    await this.getUsernameById(this.comment.user_id);

    if (this.comment && this.comment.user_id) {
      try {
        const {data} = await this.authService.downLoadImage(await this.getAvatarUrlByID(this.comment.user_id))
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
