import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TermsAndConditionsComponent} from './terms-and-conditions.component';
import {MatDialogRef} from "@angular/material/dialog";

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;
  let fixture: ComponentFixture<TermsAndConditionsComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<TermsAndConditionsComponent>>;

  beforeEach(() => {
    // Create a spy object for MatDialogRef with a close method
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [TermsAndConditionsComponent],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef} // Provide the mock instead of the real service
      ]
    });

    fixture = TestBed.createComponent(TermsAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when closeTCModal is called', () => {
    component.closeTCModal(); // Call the method
    expect(mockDialogRef.close).toHaveBeenCalled(); // Check if the MatDialogRef's close method was called
  });
});
