import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonComponent } from './common.component';
import { AuthService } from "../../../core/services/auth.service";
import { PostsService } from "../../../core/services/posts.service";
import { PreferencesService } from "../../../core/services/preference.service";
import { FriendshipService } from "../../../core/services/friendship.service";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from "@angular/material/dialog";
import { of } from 'rxjs';

describe('CommonComponent', () => {
  let component: CommonComponent;
  let fixture: ComponentFixture<CommonComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;
  let mockFriendshipService: jasmine.SpyObj<FriendshipService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['profile', 'profileById', 'session']);
    mockPostsService = jasmine.createSpyObj('PostsService', ['getPostsByUserId']);
    mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['getPreferences', 'getClubByClubId']);
    mockFriendshipService = jasmine.createSpyObj('FriendshipService', ['getFriends', 'checkFriendRequestStatus']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [CommonComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PostsService, useValue: mockPostsService },
        { provide: PreferencesService, useValue: mockPreferencesService },
        { provide: FriendshipService, useValue: mockFriendshipService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add other tests as needed
});
