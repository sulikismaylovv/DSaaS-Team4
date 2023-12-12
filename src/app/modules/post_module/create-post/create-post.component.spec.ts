import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CreatePostComponent} from './create-post.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from "../../../core/services/auth.service";
import {PostsService} from "../../../core/services/posts.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('CreatePostComponent', () => {
  let component: CreatePostComponent;
  let fixture: ComponentFixture<CreatePostComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreatePostComponent>>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['profile', 'downLoadImage']);
    mockPostsService = jasmine.createSpyObj('PostsService', ['createPost']);
    mockUserService = jasmine.createSpyObj('UserServiceService', ['getUsernameByID', 'getUserByID']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [CreatePostComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PostsService, useValue: mockPostsService },
        { provide: UserServiceService, useValue: mockUserService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should close dialog on reset form', () => {
    component.resetForm();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });


  it('should not submit post with empty content', async () => {
    component.postContent = '';
    spyOn(window, 'alert');
    await component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Please enter some content for your post.');
    expect(mockPostsService.createPost).not.toHaveBeenCalled();
  });


});
