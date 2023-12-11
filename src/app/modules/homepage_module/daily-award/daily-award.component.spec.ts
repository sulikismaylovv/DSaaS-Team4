import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyAwardComponent } from './daily-award.component';
import { MatDialogRef } from "@angular/material/dialog";
import { UserServiceService } from "../../../core/services/user-service.service";
import { AuthService } from "../../../core/services/auth.service";

describe('DailyAwardComponent', () => {
  let component: DailyAwardComponent;
  let fixture: ComponentFixture<DailyAwardComponent>;
  let mockUserService: jasmine.SpyObj<UserServiceService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DailyAwardComponent>>;

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj('UserServiceService', ['checkIfRecentlyLogged', 'setRecentlyLogged']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], { session: { user: { id: '123' } } }); // Adjust according to your session structure
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [DailyAwardComponent],
      providers: [
        { provide: UserServiceService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    });

    fixture = TestBed.createComponent(DailyAwardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  // ... additional tests as needed ...
});
