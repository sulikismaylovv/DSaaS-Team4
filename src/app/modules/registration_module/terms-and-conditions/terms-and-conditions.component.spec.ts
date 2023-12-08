import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import { MatDialog } from "@angular/material/dialog";

describe('TermsAndConditionsComponent', () => {
  let component: TermsAndConditionsComponent;
  let fixture: ComponentFixture<TermsAndConditionsComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    // Create a spy object for MatDialog with a closeAll method
    mockDialog = jasmine.createSpyObj('MatDialog', ['closeAll']);

    TestBed.configureTestingModule({
      declarations: [TermsAndConditionsComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog } // Provide the mock instead of the real service
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
    expect(mockDialog.closeAll).toHaveBeenCalled(); // Check if the MatDialog's closeAll method was called
  });
});
