// shared.service.ts
import { Injectable } from '@angular/core';
import { Profile } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private _sharedProfile: Profile | undefined;

  set sharedProfile(value: Profile | undefined) {
    this._sharedProfile = value;
  }

  get sharedProfile(): Profile | undefined {
    return this._sharedProfile;
  }
}
