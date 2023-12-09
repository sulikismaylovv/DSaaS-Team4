import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BgImageSelectorComponent } from './bg-image-selector.component';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../../../core/services/auth.service";
import { ImageDownloadService } from "../../../core/services/imageDownload.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('BgImageSelectorComponent', () => {
  let component: BgImageSelectorComponent;
  let fixture: ComponentFixture<BgImageSelectorComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BgImageSelectorComponent>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockImageService: jasmine.SpyObj<ImageDownloadService>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['uploadBackground', 'updateUser']);
    mockImageService = jasmine.createSpyObj('ImageDownloadService', ['loadBackgroundImage']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [BgImageSelectorComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }, // Mock dialog data if needed
        { provide: AuthService, useValue: mockAuthService },
        { provide: ImageDownloadService, useValue: mockImageService },
        { provide: HttpClient, useValue: mockHttpClient },
        DomSanitizer
      ]
    });

    fixture = TestBed.createComponent(BgImageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
