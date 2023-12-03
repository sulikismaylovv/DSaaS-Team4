import {Component, EventEmitter, Inject, OnInit, Output, SecurityContext} from '@angular/core';
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
      private http: HttpClient
    ) {}

    async ngOnInit(): Promise<void> {
      // Load initial background image if available
      const bgImageUrl = await this.imageService.loadBackgroundImage(this.data.id);
      if (bgImageUrl) {
        this._bgImageUrl = bgImageUrl;
        this.convertSafeUrlToBase64(this._bgImageUrl).then(base64 => {
          // You can now use the Base64 string for the image source
        }).catch(error => {
          // Handle any errors here
        });
        console.log('Background image loaded:', this.imageBase64);
        this.showCropper = true; // Show cropper when bgImage exists
      }
    }

    onZoomChange(event: any) {
      this.zoom = event.target.value;
    }

    handleImageSelection(event: Event): void {
      const fileInput: HTMLInputElement = event.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length) {
        const file: File = fileInput.files[0];
        this.imageChangedEvent = { target: { files: [file] } };
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
      console.log('Cropped image:', this.croppedImage);
      if (!this.croppedImage) {
        console.error('No image to apply.');
        return;
      }

      console.log('Applying image...');
      this.uploading = true;
      try {
        const blob = this.dataURItoBlob(this.croppedImage);
        const file = new File([blob], 'background.png', { type: 'image/png' });
        const filePath = `backgrounds/${new Date().getTime()}.png`;

        console.log('Uploading file...');
        const uploadResult = await this.authService.uploadBackground(filePath, file);
        console.log('Upload result:', uploadResult);

        console.log('Updating user profile...');
        const updateResult = await this.authService.updateUser({ background: filePath });
        console.log('Update result:', updateResult);

        this.bgImageUpload.emit(filePath);
        console.log('Image applied successfully.');
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
      // Use the sanitizer to unwrap the SafeResourceUrl back to a regular URL string
      const imageUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
      if (!imageUrl) {
        throw new Error('Invalid image URL provided.');
      }

      return new Promise((resolve, reject) => {
        // Fetch the image as a Blob
        this.http.get(imageUrl, { responseType: 'blob' }).subscribe(
          (blob) => {
            // Create a FileReader to read the Blob
            const reader = new FileReader();
            reader.onloadend = () => {
              // The result contains the Base64 string
              const base64data = reader.result as string;
              resolve(base64data);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            // Start reading the Blob as DataURL
            reader.readAsDataURL(blob);
          },
          (error) => {
            reject(error);
          }
        );
      });
    }

    cancel() {
      this.dialogRef.close();
    }
  }
