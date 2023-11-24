import { TestBed } from '@angular/core/testing';

import { FriendsLeagueServiceService } from './friends-league.service';

describe('FriendsLeagueServiceService', () => {
  let service: FriendsLeagueServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsLeagueServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
