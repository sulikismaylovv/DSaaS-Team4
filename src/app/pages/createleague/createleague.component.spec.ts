import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateleagueComponent } from './createleague.component';

describe('CreateleagueComponent', () => {
  let component: CreateleagueComponent;
  let fixture: ComponentFixture<CreateleagueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateleagueComponent]
    });
    fixture = TestBed.createComponent(CreateleagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
