import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonComponent } from '../common/common.component';
import { CreatePostComponent } from '../../post_module/create-post/create-post.component';
import { BgImageSelectorComponent } from '../bg-image-selector/bg-image-selector.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {RouterTestingModule} from "@angular/router/testing";

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent, CommonComponent, CreatePostComponent, BgImageSelectorComponent],
      imports: [MatDialogModule, BrowserAnimationsModule, RouterTestingModule], // Import MatDialogModule and BrowserAnimationsModule
      providers: [MatDialog], // Provide MatDialog service
      schemas: [NO_ERRORS_SCHEMA] // Use NO_ERRORS_SCHEMA to ignore unrecognized elements and attributes
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog); // Inject MatDialog service
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more tests as needed
});
