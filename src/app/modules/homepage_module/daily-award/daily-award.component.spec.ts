import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAwardComponent } from './daily-award.component';

describe('DailyAwardComponent', () => {
  let component: DailyAwardComponent;
  let fixture: ComponentFixture<DailyAwardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyAwardComponent]
    });
    fixture = TestBed.createComponent(DailyAwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
