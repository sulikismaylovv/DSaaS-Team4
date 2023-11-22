import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GloballeagueComponent } from './globalleague.component';

describe('GloballeagueComponent', () => {
  let component: GloballeagueComponent;
  let fixture: ComponentFixture<GloballeagueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GloballeagueComponent]
    });
    fixture = TestBed.createComponent(GloballeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
