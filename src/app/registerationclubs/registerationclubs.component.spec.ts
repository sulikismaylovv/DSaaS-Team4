import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterationclubsComponent } from './registerationclubs.component';

describe('RegisterationclubsComponent', () => {
  let component: RegisterationclubsComponent;
  let fixture: ComponentFixture<RegisterationclubsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterationclubsComponent]
    });
    fixture = TestBed.createComponent(RegisterationclubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
