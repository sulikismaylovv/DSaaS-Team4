import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registeration2Component } from './registeration2.component';

describe('Registeration2Component', () => {
  let component: Registeration2Component;
  let fixture: ComponentFixture<Registeration2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Registeration2Component]
    });
    fixture = TestBed.createComponent(Registeration2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
