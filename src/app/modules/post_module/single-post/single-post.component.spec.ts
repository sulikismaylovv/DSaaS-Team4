import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SinglePostComponent } from './single-post.component';
import { PostsService } from "../../../core/services/posts.service";
import { AuthService } from "../../../core/services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from '@angular/router/testing';

describe('SinglePostComponent', () => {
  let component: SinglePostComponent;
  let fixture: ComponentFixture<SinglePostComponent>;
  let mockPostsService: jasmine.SpyObj<PostsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    mockPostsService = jasmine.createSpyObj('PostsService', ['getPostById', 'getCommentsByPostId', 'addComment']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['restoreSession', 'profile', 'session']);
    mockActivatedRoute = { snapshot: { params: { 'id': '1' } } } as any; // Mock ActivatedRoute

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SinglePostComponent],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });
    fixture = TestBed.createComponent(SinglePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



});
