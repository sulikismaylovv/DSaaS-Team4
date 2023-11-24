import { TestBed } from '@angular/core/testing';

import { CreatefriendsleagueService } from './createfriendsleague.service';

describe('CreatefriendsleagueService', () => {
  let service: CreatefriendsleagueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreatefriendsleagueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
