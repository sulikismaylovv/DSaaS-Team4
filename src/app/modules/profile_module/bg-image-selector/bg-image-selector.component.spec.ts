import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgImageSelectorComponent } from './bg-image-selector.component';

describe('BgImageSelectorComponent', () => {
  let component: BgImageSelectorComponent;
  let fixture: ComponentFixture<BgImageSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BgImageSelectorComponent]
    });
    fixture = TestBed.createComponent(BgImageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
