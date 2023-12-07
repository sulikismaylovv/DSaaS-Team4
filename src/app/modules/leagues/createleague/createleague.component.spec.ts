import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateleagueComponent } from './createleague.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../../core/services/auth.service";
import {UserServiceService} from "../../../core/services/user-service.service";
import {using} from "rxjs";
import {CreatefriendsleagueService} from "../../../core/services/createfriendsleague.service";

describe('CreateleagueComponent', () => {
  let component: CreateleagueComponent;
  let fixture: ComponentFixture<CreateleagueComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockLeagueService: jasmine.SpyObj<CreatefriendsleagueService>


  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('authService', ['onSubmit']);
    mockUserService = jasmine.createSpyObj('userService', ['onSubmit', 'onUserSearch']);
    mockLeagueService = jasmine.createSpyObj('leagueService', ['onSubmit']);
    TestBed.configureTestingModule({

      imports: [ReactiveFormsModule, FormsModule],
      declarations: [CreateleagueComponent],
      providers:[
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserServiceService, useValue: mockUserService},
        { provide: CreatefriendsleagueService, useValue: mockLeagueService}
      ]
    });
    fixture = TestBed.createComponent(CreateleagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
