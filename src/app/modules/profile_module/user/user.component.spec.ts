import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import {CommonComponent} from "../common/common.component";
import {RouterTestingModule} from "@angular/router/testing";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {BgImageSelectorComponent} from "../bg-image-selector/bg-image-selector.component";

describe('UserComponent', () => {
  let component: UserComponent;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BgImageSelectorComponent>>;
  let fixture: ComponentFixture<UserComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;


  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);


    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UserComponent, CommonComponent], // Declare CommonComponent here
      providers: [{ provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockDialog }
      ]
    });
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
