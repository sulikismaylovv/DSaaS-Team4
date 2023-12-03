import {ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output, SecurityContext} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ImageCroppedEvent} from "ngx-image-cropper";
import {AuthService, Profile} from "../../../core/services/auth.service";
import {ImageDownloadService} from "../../../core/services/imageDownload.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-bg-image-selector',
    templateUrl: './bg-image-selector.component.html',
    styleUrls: ['./bg-image-selector.component.css']
  })
  export class BgImageSelectorComponent implements OnInit {
    uploading = false;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    zoom: number = 1;
    showCropper = false;
    imageBase64: string | undefined;

    @Output() bgImageUpload = new EventEmitter<string>();
     _bgImageUrl: SafeResourceUrl | undefined;

    constructor(
      protected readonly authService: AuthService,
      protected readonly imageService: ImageDownloadService,
      @Inject(MAT_DIALOG_DATA) public data: Profile,
      private dialogRef: MatDialogRef<BgImageSelectorComponent>,
      private sanitizer: DomSanitizer,
      private http: HttpClient,
      private cd: ChangeDetectorRef
    ) {}

    async ngOnInit(): Promise<void> {
      // Load initial background image if available
      const bgImageUrl = await this.imageService.loadBackgroundImage(this.data.id);
      this._bgImageUrl = bgImageUrl;
      this.convertSafeUrlToBase64(bgImageUrl).then(base64 => {
        this.imageBase64 = base64; // Make sure this line is executed
        this.showCropper = false; // Then set this to true to display the cropper
        // Consider adding change detection here if necessary
      }).catch(error => {
        console.error('Error converting image URL to base64:', error);
      });
    }

    onZoomChange(event: any) {
      this.zoom = event.target.value;
      this.cd.detectChanges(); // Manually trigger change detection
    }

  handleImageSelection(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length) {
      const file: File = fileInput.files[0];
      this.imageChangedEvent = {target: {files: [file]}};
      this.showCropper = true;
    }
  }

    imageCropped(event: ImageCroppedEvent) {
      // If the cropped image data is directly in the event object
      this.croppedImage = event.base64 || event; // Adapt based on actual event structure

      if (!this.croppedImage) {
        console.error('Cropped image data is not available.');
      }
    }


    imageLoaded() {
      // Image loaded
    }

    cropperReady() {
      // Cropper ready
    }

    loadImageFailed() {
      // Handle load fail
    }

    async applyImage() {
      if (!this.croppedImage) {
        console.error('No image to apply.');
        return;
      }

      this.uploading = true;
      try {
        const blob = this.dataURItoBlob(this.croppedImage);
        const file = new File([blob], 'background.png', { type: 'image/png' });
        const filePath = `backgrounds/${new Date().getTime()}.png`;
        await this.authService.uploadBackground(filePath, file);
        await this.authService.updateUser({ background: filePath });
        this.bgImageUpload.emit(filePath);
      } catch (error) {
        console.error('Error applying the image:', error);
      } finally {
        this.uploading = false;
        this.dialogRef.close();
      }
    }



    dataURItoBlob(dataURI: string | { blob: Blob }): Blob {
      if (typeof dataURI === 'object' && dataURI.blob) {
        return dataURI.blob;
      } else if (typeof dataURI === 'string') {
        // Split the base64 string in data and contentType
        const block = dataURI.split(";"); // Get the content type of the image
        const contentType = block[0].split(":")[1]; // In this case "image/png"
        const realData = block[1].split(",")[1]; // Get the real base64 content of the file

        // Convert it to a blob to upload
        return this.b64toBlob(realData, contentType);
      }

      throw new Error('The provided data URI is neither a string nor a valid object with a blob.');
    }

    // Helper function: Convert base64/encoded data to blobs
     private b64toBlob(b64Data: string, contentType='', sliceSize=512) {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, {type: contentType});
    }

  private convertSafeUrlToBase64(url: SafeResourceUrl): Promise<string> {
    const imageUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
    if (!imageUrl) {
      return Promise.reject('Invalid image URL provided.');
    }

    return new Promise((resolve, reject) => {
      this.http.get(imageUrl, { responseType: 'blob' }).subscribe(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
          this.cd.detectChanges(); // Update the view with the new image
        };
        reader.onerror = error => {
          reject(error);
        };
      }, error => {
        reject(error);
      });
    });
  }

    cancel() {
      this.dialogRef.close();
    }
  }
