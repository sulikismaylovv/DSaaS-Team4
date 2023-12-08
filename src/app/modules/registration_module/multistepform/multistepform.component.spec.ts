import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultistepformComponent } from './multistepform.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from "../../../core/services/auth.service";
import { PreferencesService } from "../../../core/services/preference.service";
import { NavbarService } from "../../../core/services/navbar.service";
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MultistepformComponent', () => {
  let component: MultistepformComponent;
  let fixture: ComponentFixture<MultistepformComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPreferencesService: jasmine.SpyObj<PreferencesService>;
  let mockNavbarService: jasmine.SpyObj<NavbarService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['authChanges', 'profile', 'updateProfile']);
    mockPreferencesService = jasmine.createSpyObj('PreferencesService', ['upsertPreference']);
    mockNavbarService = jasmine.createSpyObj('NavbarService', ['setShowNavbar']);

    await TestBed.configureTestingModule({
      declarations: [ MultistepformComponent ],
      imports: [ ReactiveFormsModule, FormsModule, RouterTestingModule ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: PreferencesService, useValue: mockPreferencesService },
        { provide: NavbarService, useValue: mockNavbarService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Use this to ignore any unrecognized elements and attributes in your component templates
    }).compileComponents();

    fixture = TestBed.createComponent(MultistepformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add additional tests as needed
});
