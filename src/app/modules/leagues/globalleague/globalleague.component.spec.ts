import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GloballeagueComponent } from './globalleague.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from "../../../core/services/auth.service";
import { UserServiceService } from "../../../core/services/user-service.service";
import { CreatefriendsleagueService } from "../../../core/services/createfriendsleague.service";
import { FriendsleagueComponent } from "../friendsleague/friendsleague.component";
import { RouterTestingModule } from "@angular/router/testing";
import {AsideComponent} from "../../../shared/aside/aside.component";

describe('GloballeagueComponent', () => {
  let component: GloballeagueComponent;
  let fixture: ComponentFixture<GloballeagueComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockCreatefriendsleagueService: jasmine.SpyObj<CreatefriendsleagueService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['authChanges']);
    mockUserService = jasmine.createSpyObj('UserServiceService', ['searchFriendsByUsername']);
    mockCreatefriendsleagueService = jasmine.createSpyObj('CreatefriendsleagueService', ['createLeague', 'addUserToLeague']);

    await TestBed.configureTestingModule({
      declarations: [
        GloballeagueComponent,
        FriendsleagueComponent, // Declare the component here
        AsideComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserServiceService, useValue: mockUserService },
        { provide: CreatefriendsleagueService, useValue: mockCreatefriendsleagueService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GloballeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Additional tests...
});
