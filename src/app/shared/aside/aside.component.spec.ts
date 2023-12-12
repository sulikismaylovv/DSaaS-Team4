import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsideComponent } from './aside.component';
import { AuthService } from "../../core/services/auth.service";
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

// Mock services and their methods
class MockAuthService {
  // Mock whatever method you need from AuthService
}

class MockUserService {
  // Mock methods from UserService
}

class MockPreferencesService {
  // Mock methods from PreferencesService
}

class MockApiService {
  // Mock methods from ApiService
  fetchStandings() {
    return of([]); // Return an observable of the expected data
  }
}

describe('AsideComponent', () => {
  let component: AsideComponent;
  let fixture: ComponentFixture<AsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AsideComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        // Provide other mocked services
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Example test case for ngOnInit
  it('should call getStanding on ngOnInit', () => {
    const standingSpy = spyOn(component, 'getStanding').and.callThrough();
    component.ngOnInit();
    expect(standingSpy).toHaveBeenCalled();
  });

  // Add more test cases as needed
});
