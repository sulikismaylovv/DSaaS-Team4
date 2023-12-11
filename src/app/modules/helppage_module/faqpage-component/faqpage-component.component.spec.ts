import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FAQPageComponentComponent } from './faqpage-component.component';
import {HelppageComponent} from "../helppage/helppage.component";

describe('FAQPageComponentComponent', () => {
  let component: FAQPageComponentComponent;
  let fixture: ComponentFixture<FAQPageComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [FAQPageComponentComponent, HelppageComponent]
    });
    fixture = TestBed.createComponent(FAQPageComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
