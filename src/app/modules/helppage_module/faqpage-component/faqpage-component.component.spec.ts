import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FAQPageComponentComponent } from './faqpage-component.component';

describe('FAQPageComponentComponent', () => {
  let component: FAQPageComponentComponent;
  let fixture: ComponentFixture<FAQPageComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FAQPageComponentComponent]
    });
    fixture = TestBed.createComponent(FAQPageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
