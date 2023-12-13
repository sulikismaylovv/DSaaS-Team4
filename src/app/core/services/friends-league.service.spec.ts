import { TestBed } from '@angular/core/testing';
import { FriendsLeagueServiceService } from './friends-league.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { AuthService } from './auth.service';

describe('FriendsLeagueService', () => {
  let service: FriendsLeagueServiceService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['supabaseClient']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['session']);

    TestBed.configureTestingModule({
      // Provide both the service being tested and its dependencies
      providers: [
        FriendsLeagueServiceService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    service = TestBed.inject(FriendsLeagueServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Additional tests...
});
