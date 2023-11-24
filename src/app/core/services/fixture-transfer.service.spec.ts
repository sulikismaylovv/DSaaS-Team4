import { TestBed } from '@angular/core/testing';

import { FixtureTransferService } from './fixture-transfer.service';

describe('FixtureTransferService', () => {
  let service: FixtureTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixtureTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
