import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { UserServiceService } from '../../../core/services/user-service.service';
import { of } from 'rxjs';
import {MatchesComponent} from "../matches/matches.component";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['authChanges']);
    mockUserService = jasmine.createSpyObj('UserServiceService', ['searchUsersByFirstThreeLetters']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent , MatchesComponent , ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserServiceService, useValue: mockUserService }
      ]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authChanges on init', () => {
    expect(mockAuthService.authChanges).toHaveBeenCalled();
  });

  it('should update user search results', async () => {
    const searchResult = [{ username: 'sulikismaylovv' }];
    mockUserService.searchUsersByFirstThreeLetters.and.returnValue(Promise.resolve(searchResult));

    await component.onUserSearch({ target: { value: 'sul' } });

    expect(component.userSearchResults).toEqual(searchResult);
    expect(mockUserService.searchUsersByFirstThreeLetters).toHaveBeenCalledWith('sul');
  });

});
