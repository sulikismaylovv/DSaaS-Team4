import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostViewComponent } from './post-view.component';
import { AuthService } from "../../../core/services/auth.service";
import { PostsService } from "../../../core/services/posts.service";
import { UserServiceService } from "../../../core/services/user-service.service";
import { ImageDownloadService } from "../../../core/services/imageDownload.service";
import { MatDialog } from "@angular/material/dialog";

describe('PostViewComponent', () => {
  let component: PostViewComponent;
  let fixture: ComponentFixture<PostViewComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockImageDownloadService: jasmine.SpyObj<ImageDownloadService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['authChanges', 'isAuthenticated$']);
    mockPostsService = jasmine.createSpyObj('PostsService', ['likePost', 'unlikePost', 'getNumberOfLikes']);
    mockUserService = jasmine.createSpyObj('UserServiceService', ['getUsernameByID']);
    mockImageDownloadService = jasmine.createSpyObj('ImageDownloadService', ['loadAvatarImage', 'loadPostImage']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PostViewComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PostsService, useValue: mockPostsService },
        { provide: UserServiceService, useValue: mockUserService },
        { provide: ImageDownloadService, useValue: mockImageDownloadService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    });
    fixture = TestBed.createComponent(PostViewComponent);
    component = fixture.componentInstance;
    component.post = {content: "", created_at: new Date(), id: 1, user_id: 'user1', image_url: 'image.jpg' }; // Example post data
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test cases for service interactions, component methods, UI interactions, etc.


});
