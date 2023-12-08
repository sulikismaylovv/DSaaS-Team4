import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { AvatarComponent } from "../account_module/avatar/avatar.component";
import { AuthService } from '../../core/services/auth.service';
import { PreferencesService } from '../../core/services/preference.service';
import { of } from 'rxjs';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['profile', 'updateProfile']);
    mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['getFavoritePreferences', 'fetchAllClubs']);

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [SettingsComponent, AvatarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PreferencesService, useValue: mockPreferencesService }
      ]
    });
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.updateSettingsForm.value).toEqual({
      username: '',
      birthdate: null,
      first_name: '',
      last_name: '',
      avatar_url: ''
    });
  });


});
