import { TestBed } from '@angular/core/testing';
import { DailyAwardService } from './daily-award.service';
import { MatDialog } from "@angular/material/dialog";
import { DailyAwardComponent } from "../../modules/homepage_module/daily-award/daily-award.component";

describe('DailyAwardService', () => {
  let service: DailyAwardService;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);

    TestBed.configureTestingModule({
      providers: [
        DailyAwardService,
        { provide: MatDialog, useValue: mockDialog }
      ]
    });

    service = TestBed.inject(DailyAwardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});
