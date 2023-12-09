import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentViewComponent } from './comment-view.component';
import { UserServiceService } from "../../../core/services/user-service.service";
import { AuthService } from "../../../core/services/auth.service";
import { DomSanitizer } from "@angular/platform-browser";
import { RouterTestingModule } from '@angular/router/testing';

describe('CommentViewComponent', () => {
  let component: CommentViewComponent;
  let fixture: ComponentFixture<CommentViewComponent>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserServiceService', ['getUsernameByID', 'getUserByID']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['downLoadImage']);

    TestBed.configureTestingModule({
      declarations: [CommentViewComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: UserServiceService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        DomSanitizer
      ]
    });

    fixture = TestBed.createComponent(CommentViewComponent);
    component = fixture.componentInstance;

    component.comment = {
      post_id: 0,
      user_id: 'test-user',
      content: 'Test comment',
      created_at: new Date() // Add a mock created_at value
      // Add other properties required by your component's template
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
