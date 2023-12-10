import { TestBed } from '@angular/core/testing';

import { DailyAwardService } from './daily-award.service';

describe('DailyAwardService', () => {
  let service: DailyAwardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyAwardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
