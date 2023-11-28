import { TestBed } from '@angular/core/testing';

import { ImageDownloadService } from './imageDownload.service';

describe('AvatarService', () => {
  let service: ImageDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
