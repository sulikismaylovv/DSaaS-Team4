import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { RouterTestingModule } from "@angular/router/testing";
import { ApiService } from "src/app/core/services/api.service";
import { AuthService } from "src/app/core/services/auth.service";
import { BetsService } from "src/app/core/services/bets.service";
import {FormsModule} from "@angular/forms";

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBetsService: jasmine.SpyObj<BetsService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('ApiService', ['fetchSingleSupabaseFixture', 'fetchStandings']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['session']);
    mockBetsService = jasmine.createSpyObj('BetsService', ['getUserCredits', 'checkIfUserIsRegistered', 'createBet']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule , FormsModule],
      declarations: [GameComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: BetsService, useValue: mockBetsService }
      ]
    });
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
