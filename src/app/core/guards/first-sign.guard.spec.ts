import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { firstSignGuard } from './first-sign.guard';

describe('firstSignGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => firstSignGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
