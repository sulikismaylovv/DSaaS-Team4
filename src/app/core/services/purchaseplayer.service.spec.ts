import { TestBed } from '@angular/core/testing';

import { PurchaseplayerService } from './purchaseplayer.service';

describe('PurchaseplayerService', () => {
  let service: PurchaseplayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
