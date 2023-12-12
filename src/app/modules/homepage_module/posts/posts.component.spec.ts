import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsComponent } from './posts.component';
import { AuthService } from "../../../core/services/auth.service";
import { PostsService } from "../../../core/services/posts.service";
import { MatDialog } from "@angular/material/dialog";
import { of } from 'rxjs';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['restoreSession', 'profile', 'isAuthenticated$']);
    mockPostsService = jasmine.createSpyObj('PostsService', ['getPosts']);

    // Mock isAuthenticated$ as an observable
    mockAuthService.isAuthenticated$ = of(true);

    TestBed.configureTestingModule({
      declarations: [PostsComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PostsService, useValue: mockPostsService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    });
    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
