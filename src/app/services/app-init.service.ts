import { Injectable } from '@angular/core';
import {ProfileService} from './profile.service';
import {LicenseKeyService} from './license-key.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  appInitStatus: AppInitStatus;

  constructor(profileService: ProfileService, licenseKeyService: LicenseKeyService) {
    this.appInitStatus = AppInitStatus.Initializing
    Promise.all([profileService.init(), licenseKeyService.init()])
      .then(() => this.appInitStatus = AppInitStatus.Succeeded)
      .catch(() => this.appInitStatus = AppInitStatus.Failed)
  }
}

export enum AppInitStatus { Succeeded, Initializing, Failed }
