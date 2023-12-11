import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { UserServiceService } from '../../../core/services/user-service.service';
import { MatDialog } from "@angular/material/dialog";
import { ThemeService } from '../../../core/services/theme.service';
import { NavbarService } from '../../../core/services/navbar.service';
import { PreferencesService } from '../../../core/services/preference.service';
import { ImageDownloadService } from '../../../core/services/imageDownload.service';
import { FixtureTransferService } from '../../../core/services/fixture-transfer.service';
import { ApiService } from '../../../core/services/api.service';
import { DailyAwardService } from '../../../core/services/daily-award.service';
import { MatchesComponent } from "../matches/matches.component";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  // Add mocks for all the services used in the component
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockNavbarService: jasmine.SpyObj<NavbarService>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;
  let mockImageDownloadService: jasmine.SpyObj<ImageDownloadService>;
  let mockFixtureTransferService: jasmine.SpyObj<FixtureTransferService>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockDailyAwardService: jasmine.SpyObj<DailyAwardService>;

  beforeEach(() => {
    // Create spy objects for all services
    mockAuthService = jasmine.createSpyObj('AuthService', ['authChanges', 'isLogged']);
    mockUserService = jasmine.createSpyObj('UserServiceService', ['searchUsersByFirstThreeLetters']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockThemeService = jasmine.createSpyObj('ThemeService', ['someMethod']);
    mockNavbarService = jasmine.createSpyObj('NavbarService', ['setShowNavbar']);
    mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['getFavoriteClub']);
    mockImageDownloadService = jasmine.createSpyObj('ImageDownloadService', ['loadAvatarImage']);
    mockFixtureTransferService = jasmine.createSpyObj('FixtureTransferService', ['someMethod']);
    mockApiService = jasmine.createSpyObj('ApiService', ['fetchStandings', 'testFunction']);
    mockDailyAwardService = jasmine.createSpyObj('DailyAwardService', ['openPopup']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent, MatchesComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserServiceService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
        // Provide the mocks to the TestBed
        { provide: ThemeService, useValue: mockThemeService },
        { provide: NavbarService, useValue: mockNavbarService },
        { provide: PreferencesService, useValue: mockPreferencesService },
        { provide: ImageDownloadService, useValue: mockImageDownloadService },
        { provide: FixtureTransferService, useValue: mockFixtureTransferService },
        { provide: ApiService, useValue: mockApiService },
        { provide: DailyAwardService, useValue: mockDailyAwardService }
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more tests as needed ...
});
